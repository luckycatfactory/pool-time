import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';

interface GroupItem {
  readonly label: string;
  readonly to: string;
}

interface SidebarGroupProps {
  readonly groupName: string;
  readonly items: GroupItem[];
}

const SidebarElement = styled.div`
  background-color: rgb(245, 247, 249);
  display: flex;
  justify-content: flex-end;
  height: 100%;
  min-width: 240px;
  width: calc((100% - 960px) / 2 + 240px);
`;

const SidebarContainer = styled.div`
  min-width: 240px;
`;

const SidebarContent = styled.div`
  padding: 24px 12px;
`;

const SidebarGroupName = styled.div`
  color: #9daab6;
  font-weight: 900;
  letter-spacing: 1.2px;
  text-transform: uppercase;
`;

const SidebarGroupItem = styled.div`
  margin: 12px 0;
`;

const SidebarGroupItemLink = styled(Link)`
  color: rgb(59, 69, 78);
  display: block;
  font-weight: 700;
  text-decoration: none;
`;

const SidebarGroup = React.memo(({ groupName, items }: SidebarGroupProps) => (
  <>
    <SidebarGroupName>{groupName}</SidebarGroupName>
    {items.map(({ label, to }) => (
      <SidebarGroupItem key={to}>
        <SidebarGroupItemLink to={to}>{label}</SidebarGroupItemLink>
      </SidebarGroupItem>
    ))}
  </>
));

SidebarGroup.displayName = 'SidebarGroup';

const groups = [
  {
    name: 'Overview',
    items: [
      { label: 'Motivation', to: '/motivation' },
      { label: 'Installation', to: '/installation' },
      { label: 'Configuration', to: '/configuration' },
    ],
  },
  {
    name: 'Examples',
    items: [{ label: 'Comments', to: '/comments' }],
  },
  {
    name: 'API',
    items: [
      { label: 'createPoolTimeProvider', to: '/createpooltimeprovider' },
      {
        label: 'useRelativeTime',
        to: '/useRelativeTime',
      },
    ],
  },
  {
    name: 'Support',
    items: [
      { label: 'Frequently Asked Questions', to: '/faqs' },
      { label: 'Open an Issue', to: '/issue' },
    ],
  },
];

const Sidebar = React.memo(() => (
  <SidebarElement>
    <SidebarContainer>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup
            groupName={group.name}
            key={group.name}
            items={group.items}
          />
        ))}
      </SidebarContent>
    </SidebarContainer>
  </SidebarElement>
));

Sidebar.displayName = 'Sidebar';

export default Sidebar;
