type User = {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  image: string | null;
  posts: {
    id: string;
  }[];
  followers: {
    id: string;
  }[];
  follows: {
    id: string;
  }[];
};

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
    posts: user.posts,
    follows: user.follows,
    followers: user.followers,
  };
};
