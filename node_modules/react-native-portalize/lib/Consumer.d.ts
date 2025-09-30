import * as React from 'react';
import { IProvider } from './Host';
interface IConsumerProps {
    children: React.ReactNode;
    manager: IProvider | null;
}
export declare const Consumer: ({ children, manager }: IConsumerProps) => null;
export {};
