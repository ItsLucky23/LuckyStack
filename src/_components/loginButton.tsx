//* button handles the login or register event called by the authForm component

import { useState } from 'react';
import { toast } from 'sonner'
import tryCatch from 'src/_functions/tryCatch';
import config from 'src/config';

interface LoginButtonType {
	ref?: React.Ref<HTMLButtonElement>; // Change here
	provider: string,
	text: string,
	img?: string
}

export default function LoginButton({ ref, provider, text, img }: LoginButtonType) {

	const [loading, setLoading] = useState(false);
	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		if (loading) { return }
		setLoading(true);

		if (provider != 'credentials') { //* for cusomt providers if you have these enabled
			window.location.href = `${config.backendUrl}/auth/api/${provider}`
			return;
		} 

		//* here all logic is for the credentials provider
		const parentElement = (e.target as HTMLElement).closest("form");

		if (!parentElement) {
			console.error("Form not found");
			setLoading(false);
			return;
		}

		// const name = ((parentElement.querySelector('input[name="name"]')) as HTMLInputElement)!.value;
		// const email = ((parentElement.querySelector('input[name="email"]')) as HTMLInputElement)!.value;
		// const password = ((parentElement.querySelector('input[name="password"]')) as HTMLInputElement)!.value;
		// const confirmPassword = ((parentElement.querySelector('input[name="confirmPassword"]')) as HTMLInputElement)!.value;

		const nameInput = parentElement.querySelector('input[name="name"]');
		const emailInput = parentElement.querySelector('input[name="email"]');
		const passwordInput = parentElement.querySelector('input[name="password"]');
		const confirmPasswordInput = parentElement.querySelector('input[name="confirmPassword"]');
		
		//* Make sure the inputs exist before accessing their value
		const name = nameInput ? (nameInput as HTMLInputElement).value : '';
		const email = emailInput ? (emailInput as HTMLInputElement).value : '';
		const password = passwordInput ? (passwordInput as HTMLInputElement).value : '';
		const confirmPassword = confirmPasswordInput ? (confirmPasswordInput as HTMLInputElement).value : '';
		

		const fetchUser = async () => {
			const response = await fetch(`${config.backendUrl}/auth/api/credentials`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					email,
					password,
					confirmPassword,
					provider
				}),
				credentials: 'include'
			})
			return await response.json() as { status: boolean, reason: string }
		}

		const [fetchUserError, fetchUserResponse] = await tryCatch(fetchUser);

		if (fetchUserError) {
			console.log(fetchUserError);
			setLoading(false);
			return;
		}

		if (!fetchUserResponse?.reason) {
			console.log('no json data provided');
			setLoading(false);
			return;
		}
		
		if (fetchUserResponse.status) { 
			if (fetchUserResponse.reason == 'user created') {
				//* new user created so we redirect to login page
				toast.success(fetchUserResponse.reason);
				setTimeout(() => {
					window.location.href = config.loginPageUrl;
				}, 1000);
			} else {
				//* user logged in so we redirect to home page
				toast.success(fetchUserResponse.reason);
				setTimeout(() => {
					//* we use window.location.href to make the page refresh, this makes socketIO reconnect and now we have a token
					window.location.href = config.loginRedirectUrl;
				}, 1000);
			}
		} else { 
			toast.error(fetchUserResponse.reason); 
			setLoading(false);
		}
	}

	return (
		<>
			{img ? (
				<button className="h-10 rounded-md bg-white text-black border border-gray-300 cursor-pointer flex gap-2 items-center justify-center hover:scale-105 transition-all duration-300"                
					onClick={(e) => { void handleSubmit(e) }}>
						<img src={'/'+img} alt={provider} className="w-5 h-5" />
						<span className="text-lg">{text}</span>
				</button>
			) : (
				<button ref={ref} className="px-8 h-10 rounded-md bg-blue-500 text-white cursor-pointer hover:scale-105 transition-all duration-300"
					onClick={(e) => { void handleSubmit(e) }}>
					{text}
				</button>
			)}
		</>
	)
}