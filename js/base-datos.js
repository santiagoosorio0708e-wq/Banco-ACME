class Database {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('acmeUsers')) {
            localStorage.setItem('acmeUsers', JSON.stringify([]));
        }
        if (!localStorage.getItem('acmeAccounts')) {
            localStorage.setItem('acmeAccounts', JSON.stringify([]));
        }
        if (!localStorage.getItem('acmeTransactions')) {
            localStorage.setItem('acmeTransactions', JSON.stringify([]));
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('acmeUsers'));
    }

    getUser(idType, idNumber) {
        const users = this.getUsers();
        return users.find(u => u.idType === idType && u.idNumber === idNumber);
    }

    createUser(userObj) {
        const users = this.getUsers();
        const cleanedIdNumber = String(userObj.idNumber ?? '').trim();

        if (!/^\d{2,11}$/.test(cleanedIdNumber)) {
            throw new Error("El número de identificación debe tener entre 2 y 11 dígitos.");
        }
        
        const exists = users.find(u => u.idType === userObj.idType && u.idNumber === cleanedIdNumber);
        if (exists) {
            throw new Error("El usuario ya se encuentra registrado con este documento.");
        }

        userObj.idNumber = cleanedIdNumber;
        users.push(userObj);
        localStorage.setItem('acmeUsers', JSON.stringify(users));

        this.createAccount(cleanedIdNumber);
        return true;
    }

    updateUser(updatedUser) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.idType === updatedUser.idType && u.idNumber === updatedUser.idNumber);
        if(index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('acmeUsers', JSON.stringify(users));
            return true;
        }
        return false;
    }

    getAccounts() {
        return JSON.parse(localStorage.getItem('acmeAccounts'));
    }

    getAccountByUserId(userIdNumber) {
        const accounts = this.getAccounts();
        return accounts.find(a => a.userId === userIdNumber);
    }
    
    getAccountByAccountNumber(accountNumber) {
        const accounts = this.getAccounts();
        return accounts.find(a => a.accountNumber === accountNumber);
    }

    createAccount(userIdNumber) {
        const accounts = this.getAccounts();
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        
        const newAccount = {
            accountNumber,
            userId: userIdNumber,
            balance: 0.0,
            createdAt: new Date().toISOString()
        };

        accounts.push(newAccount);
        localStorage.setItem('acmeAccounts', JSON.stringify(accounts));
        return newAccount;
    }

    updateBalance(accountNumber, amount, isDeposit) {
        const accounts = this.getAccounts();
        const accIndex = accounts.findIndex(a => a.accountNumber === accountNumber);
        
        if (accIndex === -1) throw new Error("Cuenta no encontrada");

        if (isDeposit) {
            accounts[accIndex].balance += Number(amount);
        } else {
            if (accounts[accIndex].balance < amount) {
                throw new Error("Fondos insuficientes");
            }
            accounts[accIndex].balance -= Number(amount);
        }

        localStorage.setItem('acmeAccounts', JSON.stringify(accounts));
        return accounts[accIndex].balance;
    }

    getTransactionsByAccount(accountNumber) {
        const txs = JSON.parse(localStorage.getItem('acmeTransactions'));
        return txs.filter(t => t.accountNumber === accountNumber).sort((a,b) => new Date(b.date) - new Date(a.date));
    }

    createTransaction(txObj) {
        const txs = JSON.parse(localStorage.getItem('acmeTransactions'));
        const newTx = {
            ...txObj,
            reference: 'REF' + Math.floor(100000 + Math.random() * 900000).toString(),
            date: new Date().toISOString()
        };

        txs.push(newTx);
        localStorage.setItem('acmeTransactions', JSON.stringify(txs));
        return newTx;
    }
}

window.db = new Database();
