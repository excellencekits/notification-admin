// next
import { NextApiRequest, NextApiResponse } from 'next';
import { config } from '../../../../../lib/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const returnTo = encodeURI(`${config.NEXT_PUBLIC_OAUTH2_SERVER}/login`);
  res.redirect(`https://&returnTo=${returnTo}`);
}
