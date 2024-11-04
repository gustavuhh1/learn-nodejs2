import { it, expect, test, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions Routes', () =>{
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
      
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  })


  it("should be able to create a new transaction", async () => {
    await request(app.server).post("/transactions").send({
      title: "New transaction test",
      amount: 5400,
      type: "credit",
    });
    expect(201);

  });

  it('should be able to list all transactions', async () => {
    const createTransactionsResponse = await request(app.server)
    .post("/transactions")
    .send({
      title: "New transaction",
      amount: 500,
      type: "credit",
    });

    const cookies = createTransactionsResponse.get("Set-Cookie") || [];

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

      expect(listTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
          amount: 500,
          title: "New transaction",
        }),
    ]);
  })

  it("should be able to get a specific transactions", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction by :id",
        amount: 200,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie") || [];

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    const transactionId =listTransactionsResponse.body.transactions[0].id

    const getTransactionRespondeById = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)

    console.log(getTransactionRespondeById.body.transaction);
    

    expect(getTransactionRespondeById.body.transaction).toEqual(
      expect.objectContaining({
        title: "New transaction by :id",
        amount: 200,
      })
    );
  })

  it("should be able to get the summary", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Credit transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie") || [];

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "Debit transaction",
        amount: 2000,
        type: "debit",
      });


    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  });




})

