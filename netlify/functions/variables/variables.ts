

import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {

    const myImportantVariable = process.env.MY_IMPORTANT_VARIABLE;
    if (!myImportantVariable) {
        return new Response(JSON.stringify({ message: 'Envs not set' }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    const responseBody = {
        importantVariable: myImportantVariable
    };

    return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
}
