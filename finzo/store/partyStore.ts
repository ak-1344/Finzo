import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Party, PartyTransaction } from '../types';
import { asyncStorageAdapter } from '../lib/storage';
import { generateId } from '../lib/utils';

interface PartyStore {
  parties: Party[];
  partyTransactions: PartyTransaction[];

  // Party CRUD
  addParty: (name: string, type: 'customer' | 'supplier') => Party;
  updateParty: (id: string, update: Partial<Party>) => void;
  deleteParty: (id: string) => void; // soft-delete

  // Party Transaction CRUD
  addPartyTransaction: (
    tx: Omit<PartyTransaction, 'id' | 'isDeleted'>
  ) => PartyTransaction;
  deletePartyTransaction: (id: string) => void; // soft-delete

  // Settlement
  settleParty: (partyId: string) => void;

  // Derived
  getActiveParties: () => Party[];
  getPartyById: (id: string) => Party | undefined;
  getTransactionsForParty: (partyId: string) => PartyTransaction[];
}

export const usePartyStore = create<PartyStore>()(
  persist(
    (set, get) => ({
      parties: [],
      partyTransactions: [],

      addParty: (name, type) => {
        const newParty: Party = {
          id: generateId(),
          name,
          type,
          balance: 0,
          createdAt: Date.now(),
          isDeleted: false,
        };
        set((state) => ({
          parties: [newParty, ...state.parties],
        }));
        return newParty;
      },

      updateParty: (id, update) =>
        set((state) => ({
          parties: state.parties.map((p) =>
            p.id === id ? { ...p, ...update } : p
          ),
        })),

      deleteParty: (id) =>
        set((state) => ({
          parties: state.parties.map((p) =>
            p.id === id ? { ...p, isDeleted: true } : p
          ),
        })),

      addPartyTransaction: (tx) => {
        const newTx: PartyTransaction = {
          ...tx,
          id: generateId(),
          isDeleted: false,
        };

        set((state) => {
          // Recalculate party balance
          const party = state.parties.find((p) => p.id === tx.partyId);
          if (!party) return { partyTransactions: [newTx, ...state.partyTransactions] };

          // 'give' = you gave them money → they owe you (+)
          // 'get' = you received money from them → they owe you less (-)
          const balanceDelta = tx.type === 'give' ? tx.amount : -tx.amount;

          return {
            partyTransactions: [newTx, ...state.partyTransactions],
            parties: state.parties.map((p) =>
              p.id === tx.partyId
                ? { ...p, balance: p.balance + balanceDelta }
                : p
            ),
          };
        });

        return newTx;
      },

      deletePartyTransaction: (id) => {
        const tx = get().partyTransactions.find((t) => t.id === id);
        if (!tx || tx.isDeleted) return;

        // Reverse the balance effect
        const balanceDelta = tx.type === 'give' ? -tx.amount : tx.amount;

        set((state) => ({
          partyTransactions: state.partyTransactions.map((t) =>
            t.id === id ? { ...t, isDeleted: true } : t
          ),
          parties: state.parties.map((p) =>
            p.id === tx.partyId
              ? { ...p, balance: p.balance + balanceDelta }
              : p
          ),
        }));
      },

      settleParty: (partyId) => {
        const party = get().parties.find((p) => p.id === partyId);
        if (!party || party.balance === 0) return;

        // Create a settlement transaction that zeros out the balance
        const settlementTx: PartyTransaction = {
          id: generateId(),
          partyId,
          type: party.balance > 0 ? 'get' : 'give',
          amount: Math.abs(party.balance),
          note: 'Settlement',
          timestamp: Date.now(),
          isSettlement: true,
          isDeleted: false,
        };

        set((state) => ({
          partyTransactions: [settlementTx, ...state.partyTransactions],
          parties: state.parties.map((p) =>
            p.id === partyId ? { ...p, balance: 0 } : p
          ),
        }));
      },

      getActiveParties: () =>
        get().parties.filter((p) => !p.isDeleted),

      getPartyById: (id) =>
        get().parties.find((p) => p.id === id && !p.isDeleted),

      getTransactionsForParty: (partyId) =>
        get()
          .partyTransactions.filter(
            (t) => t.partyId === partyId && !t.isDeleted
          )
          .sort((a, b) => b.timestamp - a.timestamp),
    }),
    {
      name: 'finzo-parties',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
