'use client';

import { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { generatePattern } from '@/utils/patternGenerator';
import { MatrixLoadingScreen } from '@/components/MatrixLoadingScreen';
import { MatrixButton } from '@/components/MatrixButton';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: black;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 1920px;
  aspect-ratio: 16/9;
`;

const PatternContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  cursor: pointer;
  border: 1px solid #0f0;
  overflow: hidden;
  
  &:hover {
    border-color: #0f0;
    box-shadow: 0 0 10px #0f0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 1920px;
  margin-top: 20px;
`;

const SaveMessage = styled.div<{ visible: boolean }>`
  color: lime;
  font-family: monospace;
  text-align: center;
  margin-top: 10px;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s;
`;

export default function Home() {
  const [patterns, setPatterns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const messageTimeoutRef = useRef<NodeJS.Timeout>();

  const generatePatterns = async () => {
    setLoading(true);
    setProgress(0);
    const newPatterns: string[] = [];

    for (let i = 0; i < 4; i++) {
      // Simulate steps for matrix-style loading
      for (let step = 0; step < 25; step++) {
        await new Promise(resolve => setTimeout(resolve, 20));
        setProgress(i * 25 + step);
      }
      const pattern = await generatePattern();
      newPatterns.push(pattern);
    }

    setPatterns(newPatterns);
    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const savePattern = async (pattern: string, index: number) => {
    const link = document.createElement('a');
    link.href = pattern;
    link.download = `trippy_art_4k_${Date.now()}_${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSaveMessage(`Saved as: ${link.download}`);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setSaveMessage('');
    }, 3000);
  };

  const saveAllPatterns = async () => {
    for (let i = 0; i < patterns.length; i++) {
      await savePattern(patterns[i], i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  useEffect(() => {
    generatePatterns();
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return <MatrixLoadingScreen progress={progress} />;
  }

  return (
    <Container>
      <Grid>
        {patterns.map((pattern, index) => (
          <PatternContainer key={index} onClick={() => savePattern(pattern, index)}>
            <img src={pattern} alt={`Pattern ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </PatternContainer>
        ))}
      </Grid>
      <ButtonContainer>
        <MatrixButton onClick={saveAllPatterns}>[ SAVE ALL ]</MatrixButton>
        <MatrixButton onClick={generatePatterns}>[ GENERATE NEXT ]</MatrixButton>
      </ButtonContainer>
      <SaveMessage visible={!!saveMessage}>{saveMessage}</SaveMessage>
    </Container>
  );
}