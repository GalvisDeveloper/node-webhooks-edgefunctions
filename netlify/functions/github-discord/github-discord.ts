import type { Context } from "@netlify/functions";

const checkEnv = (env: string | string[]) => {
    if (Array.isArray(env)) {
        env.forEach(e => {
            if (!e) {
                return new Response(JSON.stringify({ message: 'Envs not set' }), {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            }
        });
    } else if (!env) {
        return new Response(JSON.stringify({ message: 'Envs not set' }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}

const notify = async (message: string, url?: string, image?: string,) => {

    const body = {
        content: message,
        ...(image && { embeds: [{ image: { url: image } }] })
    }

    const response = await fetch(url!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        console.log('Error sending message to Discord');
        return false;
    }

    return true;

}

const onStar = (payload: any): string => {

    const { action, repository, sender, starred_at } = payload;

    return `${sender.login} ${action} starred ${repository.full_name} ${starred_at ? `at ${starred_at} ` : ''}`;
}


const onIssue = (payload: any): string => {

    const { action, repository, sender, issue } = payload;

    return `An issue was ${action} with the title: ${issue.title}`;
}

const onDeploy = (payload: any): string => {

    const { action, repository, sender, issue } = payload;

    return `A ${action} was actioned`;
}

export default async (req: Request, context: Context) => {

    const githubEvent = req.headers.get('x-github-event') ?? 'unknown';
    const payload = JSON.parse(await req.text());

    let message: string = '';

    switch (githubEvent) {
        case 'deploy':
            message = onDeploy(payload);
            break;
        case 'star':
            message = onStar(payload);
            break;
        case 'issues':
            message = onIssue(payload);
            break;
        default:
            message = `Event ${githubEvent} not supported`;

    }

    const discord_webhook_url = (Netlify.env.get('DISCORD_WEBHOOK_URL') ? Netlify.env.get('DISCORD_WEBHOOK_URL') : process.env.DISCORD_WEBHOOK_URL) ?? '';
    checkEnv(discord_webhook_url);

    const hasNotified = await notify(message, discord_webhook_url);

    return new Response(JSON.stringify({ message: `Message${hasNotified ? '' : 'not'} sent to Discord` }), {
        status: hasNotified ? 200 : 500,
        headers: {
            "Content-Type": "application/json"
        }
    });


}



