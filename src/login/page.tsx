import AuthForm from "src/_components/authForm";

export default function App() {
 
  return (
    <div className="w-full h-full flex items-center justify-center">
      <AuthForm formType={"login"} />
    </div>
  )
}