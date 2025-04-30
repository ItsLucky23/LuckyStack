import { useEffect } from "react";
import AuthForm from "src/_components/authForm";
import { useTemplate } from "src/_components/templateProvider";

export default function App() {
    const { setTemplate } = useTemplate();

    useEffect(() => {
      setTemplate('plain');
    }, []);
  
    return (
        <AuthForm formType={"register"} />
    )
}