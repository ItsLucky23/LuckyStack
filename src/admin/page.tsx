import { useEffect } from 'react';
import { useTemplate } from 'src/_components/templateProvider';

export default function Home() {
  const { setTemplate } = useTemplate();

  useEffect(() => {
    setTemplate('dashboard');
  }, []);

  return (
    <div className='flex items-center justify-center text-4xl font-semibold w-full h-full'>
      Admin
    </div>
  )
}