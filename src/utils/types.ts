export type Wishlist = {
    wish: Array<Wish>;
    user: string;
    hash: string;
    title: string;
    created_at: string;
}

export type Wish = {
    id: number;
    url: string;
    name: string;
    price: number;
    bought_by?: string;
    comment?: string;
    picture?: string;
}