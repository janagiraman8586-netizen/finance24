declare module 'react' {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P) => any;
  export type ReactElement = any;
  export type FormEvent<T = any> = any;
  export type MouseEvent<T = any> = any;
  export type ChangeEvent<T = any> = any;
  export type MouseEventHandler<T = any> = (event: any) => void;
  export type HTMLAttributes<T = any> = any;
  export type ButtonHTMLAttributes<T = any> = any;
  export type InputHTMLAttributes<T = any> = any;

  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useRef<T>(initialValue?: T): { current: T };
  export function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export interface ForwardRefExoticComponent<P> {
    (props: P): any;
    displayName?: string;
  }
  export function forwardRef<T, P = {}>(render: (props: P, ref: any) => any): ForwardRefExoticComponent<P & { ref?: any }>;
  export function createElement(type: any, props?: any, ...children: any[]): any;

  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare module 'lucide-react' {
  export const LayoutDashboard: any;
  export const TrendingUp: any;
  export const TrendingDown: any;
  export const Receipt: any;
  export const PieChart: any;
  export const Target: any;
  export const BarChart3: any;
  export const FileText: any;
  export const Settings: any;
  export const Shield: any;
  export const ShieldAlert: any;
  export const Users: any;
  export const User: any;
  export const UserCheck: any;
  export const UserX: any;
  export const FolderTree: any;
  export const Bell: any;
  export const History: any;
  export const LogOut: any;
  export const CheckCheck: any;
  export const AlertTriangle: any;
  export const Info: any;
  export const Sparkles: any;
  export const CheckCircle2: any;
  export const Wallet: any;
  export const PiggyBank: any;
  export const Plus: any;
  export const ArrowUpRight: any;
  export const ArrowDownLeft: any;
  export const Calendar: any;
  export const Activity: any;
  export const AlertCircle: any;
  export const Search: any;
  export const Filter: any;
  export const Trash2: any;
  export const Edit2: any;
  export const Download: any;
  export const ChevronLeft: any;
  export const ChevronRight: any;
  export const ArrowUpDown: any;
  export const ArrowUp: any;
  export const ArrowDown: any;
  export const ArrowRight: any;
  export const Eye: any;
  export const Clock: any;
  export const ShieldCheck: any;
  export const CheckCircle: any;
  export const HelpCircle: any;
  export const Lightbulb: any;
  export const FileSpreadsheet: any;
  export const Layers: any;
  export const Menu: any;
  export const Printer: any;
  export const CreditCard: any;
  export const Lock: any;
  export const X: any;
  const allIcons: { [key: string]: any };
  export default allIcons;
}

declare module 'recharts' {
  export const ResponsiveContainer: any;
  export const BarChart: any;
  export const Bar: any;
  export const XAxis: any;
  export const YAxis: any;
  export const Tooltip: any;
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
  export const LineChart: any;
  export const Line: any;
  export const AreaChart: any;
  export const Area: any;
  export const CartesianGrid: any;
  export const Legend: any;
  const allRecharts: { [key: string]: any };
  export default allRecharts;
}

declare module 'axios' {
  const axios: any;
  export default axios;
  export const create: any;
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

declare module 'next/navigation' {
  export function usePathname(): string;
  export function useRouter(): any;
  export function useSearchParams(): any;
}
