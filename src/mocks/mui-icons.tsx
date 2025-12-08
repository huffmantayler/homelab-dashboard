import React from 'react';

const MockIcon = (props: React.ComponentProps<'svg'>) => <svg data-testid="mock-icon" {...props} />;

export const Storage = MockIcon;
export const Memory = MockIcon;
export const Speed = MockIcon;
export const Dns = MockIcon;
export const Apps = MockIcon;
export const Dashboard = MockIcon;
export const Settings = MockIcon;
export const NetworkCheck = MockIcon;
export const Security = MockIcon;
export const MonitorHeart = MockIcon;
export const Block = MockIcon;
export const Public = MockIcon;
export const Devices = MockIcon;
export const Edit = MockIcon;
export const Save = MockIcon;
export const Lightbulb = MockIcon;
export const DragIndicator = MockIcon;
// Deep imports might fallback to default export, but defining them doesn't hurt
export const CheckCircle = MockIcon;
export const Error = MockIcon;
export const Pending = MockIcon;
export const Construction = MockIcon;
