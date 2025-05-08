import { createContext, useContext, useState } from 'react';
import Navbar from "src/_components/Navbar";
import Middleware from 'src/_components/middleware';

const Templates = {
  dashboard: DashboardTemplate,
  plain: PlainTemplate,
}

function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full flex flex-row bg-white">
      <div className="w-full h-full flex flex-col md:flex-row">
        <Navbar/>
        <div className="md:flex-grow h-full text-black">
          <Middleware>
            {children}
          </Middleware>
        </div>
      </div>
    </div>
  )
}

function PlainTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  )
}

type Template = 'dashboard' | 'plain';
const TemplateContext = createContext<{ setTemplate: (template: Template) => void; }>({ setTemplate: () => {} });

export function useTemplate() {
  return useContext(TemplateContext);
}

export default function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [template, setTemplate] = useState<Template>('plain');

  return (
    <TemplateContext.Provider value={{ setTemplate }}>
      {Templates[template]({ children })}
    </TemplateContext.Provider>
  )
}