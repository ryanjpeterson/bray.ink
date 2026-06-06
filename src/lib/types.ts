export type CopyRow = {
	id: string;
	key: string;
	value: string;
	updated_at: string;
};

export type Submission = {
	id: string;
	name: string;
	email: string;
	message: string;
	created_at: string;
	read: boolean;
};

export type InstagramPost = {
	id: string;
	media_url: string;
	permalink: string;
	media_type: 'IMAGE' | 'CAROUSEL_ALBUM' | 'VIDEO';
	caption?: string;
	timestamp: string;
};

export type SiteCopy = Record<string, string>;
