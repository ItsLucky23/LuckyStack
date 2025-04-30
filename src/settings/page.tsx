import { useEffect } from 'react';
import { useTemplate } from 'src/_components/templateProvider';

export default function Home() {
  const { setTemplate } = useTemplate();

  useEffect(() => {
    setTemplate('dashboard');
  }, []);

  return (
    <div>Settings</div>
  )
}