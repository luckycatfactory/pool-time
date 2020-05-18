import React from 'react';
import styled from 'styled-components';

import useRenderCount from '../utilities/useRenderCount';

const RenderCountElement = styled.div`
  background-color: grey;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  margin: 0 4px;
  padding: 2px 8px;
`;

const RenderCount: React.FC = () => {
  const renderCount = useRenderCount();
  const suffix = renderCount > 1 ? 'renders' : 'render';
  const text = `${renderCount} ${suffix}`;

  return <RenderCountElement>{text}</RenderCountElement>;
};

RenderCount.displayName = 'RenderCount';

export default RenderCount;
