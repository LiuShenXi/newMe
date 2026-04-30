import { create } from 'zustand';

import { treeFruits, type TreeFruit } from '../features/tree/data/fruits';

interface PrototypeState {
  addFruit: (fruit: TreeFruit) => void;
  fruits: TreeFruit[];
  markListViewed: () => void;
  viewedList: boolean;
}

export const usePrototypeStore = create<PrototypeState>((set) => ({
  fruits: treeFruits,
  viewedList: false,
  addFruit(fruit) {
    set((state) => {
      if (state.fruits.some((item) => item.week === fruit.week)) {
        return state;
      }

      return { fruits: [...state.fruits, fruit] };
    });
  },
  markListViewed() {
    set({ viewedList: true });
  },
}));
