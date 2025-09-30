import * as React from 'react';
export interface IManagerHandles {
    mount(key: string, children: React.ReactNode): void;
    update(key?: string, children?: React.ReactNode): void;
    unmount(key?: string): void;
}
export declare const Manager: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
