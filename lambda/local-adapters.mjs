/**
 * Local adapters for DynamoDB and Secrets Manager.
 * Used when running Lambda locally (LOCAL_MODE=true).
 */

// In-memory DynamoDB replacement
export class LocalDynamoDB {
    constructor() {
        this.store = new Map(); // key: `${address}::${randomNonce}` → item
    }

    _key(address, randomNonce) {
        return `${address.toLowerCase()}::${randomNonce}`;
    }

    async scan({ TableName, ConsistentRead }) {
        return { Items: Array.from(this.store.values()) };
    }

    async put({ TableName, Item, ConditionExpression, ExpressionAttributeValues }) {
        const key = this._key(Item.address, Item.randomNonce);
        this.store.set(key, { ...Item });
    }

    async update({ TableName, Key, UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues, ConditionExpression }) {
        const key = this._key(Key.address, Key.randomNonce);
        const item = this.store.get(key);
        if (!item) {
            const err = new Error('Item not found');
            err.name = 'ConditionalCheckFailedException';
            throw err;
        }

        // Parse SET expressions: "SET #status = :status, concluded = :concluded, ..."
        const setMatch = UpdateExpression.match(/SET\s+(.+)/i);
        if (setMatch) {
            const assignments = setMatch[1].split(',').map(s => s.trim());
            for (const assignment of assignments) {
                const [lhs, rhs] = assignment.split('=').map(s => s.trim());
                const fieldName = ExpressionAttributeNames?.[lhs] || lhs;
                const value = ExpressionAttributeValues?.[rhs];
                item[fieldName] = value;
            }
        }

        this.store.set(key, item);
    }

    async delete({ TableName, Key, ConditionExpression }) {
        const key = this._key(Key.address, Key.randomNonce);
        this.store.delete(key);
    }

    async transactWrite({ TransactItems }) {
        for (const txItem of TransactItems) {
            if (txItem.Put) {
                const key = this._key(txItem.Put.Item.address, txItem.Put.Item.randomNonce);
                this.store.set(key, { ...txItem.Put.Item });
            }
        }
    }
}

// Local Secrets Manager replacement — reads from env
export class LocalSecretsManager {
    async send(command) {
        return {
            SecretString: JSON.stringify({
                NodeSignatureSignerSecretKey: process.env.SIGNER_PRIVATE_KEY
            })
        };
    }
}
