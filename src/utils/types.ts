export type Wishlist = {
    wish: Wish[];
    user: string;
    hash: string;
    title: string;
}

export type Wish = {
    id: number;
    url: string;
    name: string;
}