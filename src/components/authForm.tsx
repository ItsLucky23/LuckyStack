//* form used for the login and register pages
//* all logic is handled by the loginButton component

import { useRef } from "react";
import LoginButton from "src/components/loginButton";
import { Link } from "react-router-dom";
import { providers } from "src/config"

export default function AuthForm({ formType }: { formType: string }) {

	const title = formType === 'login' ? 'Sign in to your account' : 'Create a new account';
	const subTitle = formType === 'login'? 'Don\'t have an account yet? ' : 'Already have an account? ';
	const subTitleSpan = formType === 'login' ? 'Create on now': 'Log in';
	const buttonText = formType === 'login'? 'Log in' : 'Sign up';
	const redirectURL = formType === 'login'? '/register' : '/login';

	const loginButtonRef = useRef<HTMLButtonElement>(null);
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();  // Prevent form submission on Enter key
			loginButtonRef.current?.click();
		}
	};

	return (
		<div className="w-full h-full flex items-center justify-center">
			<form onKeyDown={handleKeyDown} className="p-8 bg-white rounded-md text-black flex flex-col gap-10 max-w-[400px] w-full">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-lg">{title}</h1>
					<p className="font-medium text-sm text-gray-400">{subTitle}<Link to={redirectURL} className="text-blue-500 cursor-pointer">{subTitleSpan}</Link></p>
				</div>
				{providers.includes('credentials') &&
					<>
						<div className="flex flex-col gap-4">
							{formType != 'login' &&
								<div className="flex flex-col gap-2">
									<label className="font-medium text-sm">Name</label>
									<input type="text" name="name" placeholder="John Pork" className="rounded-md w-full h-8 border border-gray-300 focus:outline-blue-500 p-2"></input>
								</div>
							}
							<div className="flex flex-col gap-2">
								<label className="font-medium text-sm">Email address</label>
								<input type="email" name="email" placeholder="johnpork@gmail.com" className="rounded-md w-full h-8 border border-gray-300 focus:outline-blue-500 p-2"></input>
							</div>
							<div className="flex flex-col gap-2">
								<label className="font-medium text-sm">Password</label>
								<input type="password" name="password" placeholder="********" className="rounded-md w-full h-8 border border-gray-300 focus:outline-blue-500 p-2"></input>
							</div>
							{formType != 'login' &&
								<div className="flex flex-col gap-2">
									<label className="font-medium text-sm">Confirm password</label>
									<input type="password" name="confirmPassword" placeholder="********" className="rounded-md w-full h-8 border border-gray-300 focus:outline-blue-500 p-2"></input>
								</div>
							}
							<div className="flex items-center justify-center"> 
								{/* we display the div event if there is no content inside it for the spacing */}
								{formType == 'login' &&
									<button className="px-8 h-10 rounded-md text-blue-500 cursor-pointer hover:scale-105 transition-all duration-300">Forgot Password?</button>
								}
							</div>
							<LoginButton ref={loginButtonRef} provider={"credentials"} text={buttonText} />
						</div>
						{/* <div></div> */}
						<div className="flex items-center w-full text-gray-500 text-sm before:flex-1 before:border-t before:border-gray-300 before:content-[''] after:flex-1 after:border-t after:border-gray-300 after:content-['']">
							<span className="px-4 bg-white text-black">Or continue with</span>
						</div>
					</>
				}
				<div className="grid grid-cols-2 gap-2 justify-between">
					{providers.map((provider) => (
						(provider != 'credentials' &&
							<LoginButton key={provider} provider={provider} text={provider.charAt(0).toUpperCase() + provider.slice(1)} img={`${provider}.png`} />
						)
					))}
				</div>
			</form>
		</div>
	)
}