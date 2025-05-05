import { toast } from "sonner";

type notifyOnNavigationProps = {
  notifyType: 'success' | 'error' | 'info' | 'warning',
  message: string
}

const notifies: notifyOnNavigationProps[] = [];
export default function notifyOnNavigation({ notifyType, message }: notifyOnNavigationProps) {
  notifies.push({ notifyType, message })
}

export function runNotifyOnNavigation() {
  for (const notify of notifies) {
    if (!notify.notifyType || !notify.message) continue;
    toast[notify.notifyType](notify.message);
  }

  notifies.length = 0;
}