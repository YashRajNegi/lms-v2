import { createContext, useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const { user, isLoaded } = useUser();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/courses');
                setCourses(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);
    
    const value = {
        user,
        isLoaded,
        courses,
        loading,
        error,
        setCourses
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};