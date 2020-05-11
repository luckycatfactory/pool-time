import React from 'react';
import styled from 'styled-components';

import Sidebar from './Sidebar';

interface MainProps {
  children: React.ReactNode;
  contentMaxWidth: number;
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
`;

const Main = React.memo(({ children, contentMaxWidth }: MainProps) => (
  <MainElement maxWidth={contentMaxWidth}>
    <Sidebar />
    <MainContent>{children}</MainContent>
  </MainElement>
));

Main.displayName = 'Main';

export default Main;
