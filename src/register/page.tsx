import { useEffect } from "react";
import LoginForm from "src/_components/loginForm";
import { useTemplate } from "src/_components/templateProvider";

export default function App() {
    const { setTemplate } = useTemplate();

    useEffect(() => {
      setTemplate('plain');
    }, []);
  
    return (
      <LoginForm formType="register" />
    )
}