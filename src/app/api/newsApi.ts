import { NewsArticle } from '../types/portal';
import { apiAction } from './client';

type ArticleInput = Omit<NewsArticle, 'id'> & { id?: string };

export const newsApi = {
  create: (article: ArticleInput) => apiAction<{ id: string }>('news', 'createNewsArticle', { article }),
  update: (articleId: string, patch: Partial<NewsArticle>) =>
    apiAction('news', 'updateNewsArticle', { articleId, patch }),
  remove: (articleId: string) => apiAction('news', 'deleteNewsArticle', { articleId }),

  createSubmission: (article: ArticleInput) => apiAction<{ id: string }>('news', 'createNewsSubmission', { article }),
  updateSubmission: (submissionId: string, article: ArticleInput) =>
    apiAction('news', 'updateNewsSubmission', { submissionId, article }),
  reviewSubmission: (submissionId: string, approve: boolean, comment = '') =>
    apiAction<{ newsId: string | null }>('news', 'reviewNewsSubmission', { submissionId, approve, comment }),
};
