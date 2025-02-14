import { createContext, ReactNode, useState } from "react";

interface AppContextType {
    backendUrl: string;
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    role: string;
    setRole: React.Dispatch<React.SetStateAction<string>>;
}

export const appContext = createContext<AppContextType | null>(null);

interface AppContextProviderProps {
    children: ReactNode;
}

export const AppContextProvider = (props: AppContextProviderProps) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState("");

    const value = {
        backendUrl,
        isLoggedIn,
        name,
        setIsLoggedIn,
        setName,
        setUserData,
        userData, 
        role,
        setRole,
    }

    return(
        <appContext.Provider value={value}>
            {props.children}
        </appContext.Provider>
    )
}