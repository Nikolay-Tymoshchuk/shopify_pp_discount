import db from '~/db.server';

class SessionService {
    /* -------------------------------------------------------------------------- */
    /*                       LABEL: get session by shop domain                    */
    /* -------------------------------------------------------------------------- */

    async getSession({
        shopDomain
    }: {
        shopDomain: string;
    }): Promise<Record<'accessToken', string> | null> {
        return db.session.findFirst({
            where: { shop: shopDomain },
            select: {
                accessToken: true
            }
        });
    }
}

export const sessionService = new SessionService();
