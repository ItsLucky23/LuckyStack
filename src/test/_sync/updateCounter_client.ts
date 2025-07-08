type updateCounterProps = {
 serverData: Record<string, any>;
 clientData: Record<string, any>;
}

export default function updateCounter({ serverData, clientData }: updateCounterProps) {
  console.log(serverData); // output: true
  console.log(clientData); // output: { product: 'shoes', amount: 5 }

  const counter = document.querySelector(`.${clientData.product}Counter strong`) as HTMLSpanElement;
  if (!counter) { return }
  const newValue = (parseInt(counter.innerText) + (clientData.increase ? 1 : -1)).toString();
  counter.innerText = newValue;
}