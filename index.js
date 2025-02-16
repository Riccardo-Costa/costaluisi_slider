const createMiddleware = () => {
    return {
        load: async () => {
            const response = await fetch("7images");
            const json = await response.json();
            return json; 
        }
    };
};

const controller = async (middleware) => {
    const data = await middleware.load(); 
    console.log(data); 
};
