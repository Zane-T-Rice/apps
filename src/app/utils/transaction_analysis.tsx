export type RawTransaction = {
  Account: string;
  "Transaction Date": string;
  "Posted Date": string;
  "No.": string;
  Description: string;
  Debit: string;
  Credit: string;
  "Long Description": string;
};

export type DataTransaction = {
  Account: string;
  "Transaction Date": Date;
  "Posted Date"?: Date;
  "No."?: string;
  Description: string;
  Debit?: number;
  Credit?: number;
  "Long Description": string;
};

export type TransactionGroupings = {
  [key: string]: {
    merchants: string[];
    transactions: DataTransaction[];
    transactionsGroupedByDay: {
      [key: string]: DataTransaction[];
    };
    transactionsGroupedByMonth: {
      [key: string]: DataTransaction[];
    };
    transactionsGroupedByYear: {
      [key: string]: DataTransaction[];
    };
  };
};

export default class TransactionAnalysis {
  private transactionGroupings: TransactionGroupings;

  constructor(transactions: RawTransaction[]) {
    this.transactionGroupings = {};

    transactions.forEach((transaction) => {
      const dataTransaction = this.rawTransactionToDataTransaction(transaction);
      if (!this.transactionGroupings[dataTransaction.Account]) {
        this.transactionGroupings[dataTransaction.Account] = {
          merchants: [],
          transactions: [],
          transactionsGroupedByDay: {},
          transactionsGroupedByMonth: {},
          transactionsGroupedByYear: {},
        };
      }

      this.transactionGroupings[dataTransaction.Account].transactions.push(
        dataTransaction
      );

      // Day
      if (
        !this.transactionGroupings[dataTransaction.Account]
          .transactionsGroupedByDay[transaction["Transaction Date"]]
      ) {
        this.transactionGroupings[
          dataTransaction.Account
        ].transactionsGroupedByDay[transaction["Transaction Date"]] = [];
      }
      this.transactionGroupings[
        dataTransaction.Account
      ].transactionsGroupedByDay[transaction["Transaction Date"]].push(
        dataTransaction
      );

      // Month
      if (
        !this.transactionGroupings[dataTransaction.Account]
          .transactionsGroupedByMonth[
          `${dataTransaction["Transaction Date"].getMonth()}-${dataTransaction[
            "Transaction Date"
          ].getFullYear()}`
        ]
      ) {
        this.transactionGroupings[
          dataTransaction.Account
        ].transactionsGroupedByMonth[
          `${dataTransaction["Transaction Date"].getMonth()}-${dataTransaction[
            "Transaction Date"
          ].getFullYear()}`
        ] = [];
      }
      this.transactionGroupings[
        dataTransaction.Account
      ].transactionsGroupedByMonth[
        `${dataTransaction["Transaction Date"].getMonth()}-${dataTransaction[
          "Transaction Date"
        ].getFullYear()}`
      ].push(dataTransaction);

      // Year
      if (
        !this.transactionGroupings[dataTransaction.Account]
          .transactionsGroupedByYear[
          `${dataTransaction["Transaction Date"].getFullYear()}`
        ]
      ) {
        this.transactionGroupings[
          dataTransaction.Account
        ].transactionsGroupedByYear[
          `${dataTransaction["Transaction Date"].getFullYear()}`
        ] = [];
      }
      this.transactionGroupings[
        dataTransaction.Account
      ].transactionsGroupedByYear[
        `${dataTransaction["Transaction Date"].getFullYear()}`
      ].push(dataTransaction);
    });
  }

  rawTransactionToDataTransaction = (
    transaction: RawTransaction
  ): DataTransaction => {
    return {
      Account: transaction.Account,
      "Transaction Date": new Date(transaction["Transaction Date"]),
      "Posted Date": new Date(transaction["Posted Date"]),
      "No.": transaction["No."],
      Description: transaction.Description,
      Debit: transaction.Debit ? parseInt(transaction.Debit) : undefined,
      Credit: transaction.Credit ? parseInt(transaction.Credit) : undefined,
      "Long Description": transaction["Long Description"],
    };
  };

  calculateTotals = (
    groupedTransactions: {
      [key: string]: DataTransaction[];
    },
    merchants?: string[],
    field: "Debit" | "Credit" = "Debit"
  ) => {
    const totals: { transactionDate: Date; total: number }[] = [];
    Object.keys(groupedTransactions).forEach((key) => {
      totals.push({
        transactionDate: groupedTransactions[key][0]["Transaction Date"],
        total:
          groupedTransactions[key]
            .filter(
              (transaction) =>
                !merchants || merchants.indexOf(transaction.Description) !== -1
            )
            .map((transaction) => transaction[field] || 0)
            .reduce((a, b) => {
              return (a ?? 0) + (b ?? 0);
            }, 0) ?? 0,
      });
    });
    return totals.filter((total) =>
      field === "Debit" ? total.total < 0 : total.total > 0
    );
  };

  getTransactions = (account: string, merchants?: string[]) =>
    this.transactionGroupings?.[account]?.transactions || [];
  getYearlyTotals = (
    account: string,
    merchants?: string[],
    field: "Debit" | "Credit" = "Debit"
  ) => {
    if (!this.transactionGroupings?.[account]) return [];

    const totals = this.calculateTotals(
      this.transactionGroupings?.[account].transactionsGroupedByYear,
      merchants,
      field
    );

    return totals;
  };
  getMonthlyTotals = (
    account: string,
    merchants?: string[],
    field: "Debit" | "Credit" = "Debit"
  ) => {
    if (!this.transactionGroupings?.[account]) return [];
    return this.calculateTotals(
      this.transactionGroupings?.[account].transactionsGroupedByMonth,
      merchants,
      field
    );
  };
  getDailyTotals = (
    account: string,
    merchants?: string[],
    field: "Debit" | "Credit" = "Debit"
  ) => {
    if (!this.transactionGroupings?.[account]) return [];
    return this.calculateTotals(
      this.transactionGroupings?.[account].transactionsGroupedByDay,
      merchants,
      field
    );
  };

  getAccounts = (): string[] =>
    this.transactionGroupings ? Object.keys(this.transactionGroupings) : [];

  getMerchants = (account: string): string[] => {
    if (!this.transactionGroupings?.[account]) return [];

    const merchants = [
      ...new Set(
        this.transactionGroupings?.[account].transactions.map(
          (transaction) => transaction.Description
        )
      ),
    ];
    this.transactionGroupings[account].merchants = merchants;

    return merchants;
  };
}
