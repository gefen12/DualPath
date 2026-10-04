// site.json and quiz.json are single objects, so they're validated here rather
// than as content collections. A bad file throws at build time.
import siteJson from '../../content/site.json';
import quizJson from '../../content/quiz.json';
import { quizSchema, siteSchema } from './schemas';

export const site = siteSchema.parse(siteJson);
export const quiz = quizSchema.parse(quizJson);
