import React, { useEffect, useState } from 'react';
import { All } from './../../types';

import styled from './../../styles/styled';
import { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

import { useAccount, useBalance, useNetwork } from 'wagmi';
import useIsMounted from '../../hooks/useIsMounted';

import Chain from '../Common/Chain';
import supportedChains from '../../constants/supportedChains';
import ThemedButton from '../Common/ThemedButton';
import { nFormatter } from '../../utils';

const Container = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
const PlaceholderKeyframes = keyframes`
  0%,100%{ opacity: 0.1; transform: scale(0.75); }
  50%{ opacity: 0.75; transform: scale(1.2) }
`;
const PulseContainer = styled.div`
  pointer-events: none;
  user-select: none;
  padding: 0 5px;
  span {
    display: inline-block;
    vertical-align: middle;
    margin: 0 2px;
    width: 3px;
    height: 3px;
    border-radius: 4px;
    background: currentColor;
    animation: ${PlaceholderKeyframes} 1000ms ease infinite both;
  }
`;

type BalanceProps = {
  hideIcon?: boolean;
  hideSymbol?: boolean;
};

export const Balance: React.FC<BalanceProps> = ({ hideIcon, hideSymbol }) => {
  const isMounted = useIsMounted();
  const [isInitial, setIsInitial] = useState(true);

  const { address } = useAccount();
  const { chain } = useNetwork();

  const { data: balance } = useBalance({
    address,
    chainId: chain?.id,
    watch: true,
  });

  const currentChain = supportedChains.find((c) => c.id === chain?.id);
  const state = `${
    !isMounted || balance?.formatted === undefined
      ? `balance-loading`
      : `balance-${currentChain?.id}-${balance?.formatted}`
  }`;

  useEffect(() => {
    setIsInitial(false);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={state}
          initial={
            balance?.formatted !== undefined && isInitial
              ? {
                  opacity: 1,
                }
              : { opacity: 0, position: 'absolute', top: 0, left: 0, bottom: 0 }
          }
          animate={{ opacity: 1, position: 'relative' }}
          exit={{
            opacity: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
          }}
          transition={{
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1],
            delay: 0.4,
          }}
        >
          {!address || !isMounted || balance?.formatted === undefined ? (
            <Container>
              {!hideIcon && <Chain />}
              <span style={{ minWidth: 32 }}>
                <PulseContainer>
                  <span style={{ animationDelay: '0ms' }} />
                  <span style={{ animationDelay: '50ms' }} />
                  <span style={{ animationDelay: '100ms' }} />
                </PulseContainer>
              </span>
            </Container>
          ) : chain?.unsupported ? (
            <Container>
              {!hideIcon && <Chain id={chain?.id} />}
              <span style={{ minWidth: 32 }}>???</span>
            </Container>
          ) : (
            <Container>
              {!hideIcon && <Chain id={chain?.id} />}
              <span style={{ minWidth: 32 }}>
                {nFormatter(Number(balance?.formatted))}
              </span>
              {!hideSymbol && ` ${balance?.symbol}`}
            </Container>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const BalanceButton: React.FC<All & BalanceProps> = ({
  theme,
  mode,
  customTheme,
  hideIcon,
  hideSymbol,
}) => {
  return (
    <ThemedButton
      duration={0.4}
      variant={'secondary'}
      theme={theme}
      mode={mode}
      customTheme={customTheme}
    >
      <Balance hideIcon={hideIcon} hideSymbol={hideSymbol} />
    </ThemedButton>
  );
};
export default BalanceButton;
