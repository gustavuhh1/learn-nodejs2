// Definição de Tipos

import { Knex } from "knex";
import { string } from 'zod';


declare module 'knex/types/tables' {
    export interface Tables {
      transactions: {
        id: string;
        title: string;
        amount: number;
        created_at: string;
        session_id?: string;
      };
    }
}