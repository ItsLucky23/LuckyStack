import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplate } from 'src/_components/templateProvider';

export default function Home() {
  const { setTemplate } = useTemplate();
  const router = useNavigate();

  useEffect(() => {
    setTemplate('dashboard');
  }, []);

  return (
    <div className='flex items-center justify-center text-4xl font-semibold w-full h-full'>
      settings
    </div>
  )
}