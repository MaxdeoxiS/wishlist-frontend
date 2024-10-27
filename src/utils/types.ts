export type Wishlist = {
    wishes: Array<Wish>;
    user: string;
    id: string;
    title: string;
    created_at: string;
}

export type Wish = {
    id: number;
    url?: string;
    name: string;
    price: number;
    bought_by?: string;
    comment?: string;
    picture?: string;
}

export type CreateWish = Omit<Wish, "id" | "bought_by" | "picture">
export type CreateList = Omit<Wishlist, "id" | "created_at" | "wishes">