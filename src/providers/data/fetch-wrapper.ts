import { GraphQLClient } from "@refinedev/nestjs-query";
import { Await } from "react-router-dom";
import { GraphQLFormattedError } from "graphql";


type Error = {
    message: string;
    statusCode: string;

}

const customFetch = async (url: string, options: RequestInit) => {
    const AccessToken = localStorage.getItem("access_token");

    const headers = options.headers as Record<string, string>;
    return await fetch(url, {
        ...options,
        headers: {
            ...headers,
            Authorization: headers?.Authorization || `Bearer ${AccessToken}`,
            "ContentType": "application/json",
            "Apollo-Require-Preflight": "true",
        },
    });
}

const graphQLErrors = (body:Record<"errors", GraphQLFormattedError[] | undefined>): Error | null => {
    if(!body){
        return{
            message: "Unknown error",
            statusCode: "Internal Server Error"
        }
    }
    if("errors" in body){
        const errors = body?.errors;
        const messages = errors?.map((error) => error?.message).join("");
        const code = errors?.[0]?.extensions?.code;

        return{
            message: messages || JSON.stringify(errors),
            statusCode: code || 500
        }
    }

    return null;
}


export const fetchWrapper = async (url: string, options: RequestInit) => {
    const response = await customFetch(url, options);
    const responseClone = response.clone();

    const body = await responseClone.json();
    const error = graphQLErrors(body);

    if(error){
        throw error;
    }

    return response;
}