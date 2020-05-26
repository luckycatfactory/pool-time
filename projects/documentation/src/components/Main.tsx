import React from 'react';
import styled from 'styled-components';

import Sidebar from './Sidebar';

interface MainProps {
  readonly children: React.ReactNode;
}

const MainElement = styled.main`
  display: flex;
  flex: 1;
  flex-direction: row;
  width: 100%;
`;

const MainContent = styled.div`
  background-color: white;
  flex: 1;
  padding: 24px;
`;

const Main = React.memo(({ children }: MainProps) => (
  <MainElement>
    <Sidebar />
    <MainContent>{children}</MainContent>
  </MainElement>
));

Main.displayName = 'Main';

export default Main;
