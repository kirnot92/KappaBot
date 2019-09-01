
export default class Dictionary<TKey, TValue>
{
    _map: Map<TKey,TValue> = new Map<TKey,  TValue>();

    constructor(init?: { key: TKey; value: TValue; }[])
    {
        if (init === undefined) {
            return
        }

        for (const { key, value } of init) {
            this.Add(key, value);
        }
    }

    public Add(key: TKey, value: TValue)
    {
        if (this.ContainsKey(key))
        {
            throw new Error("키 중복");
        }
        this._map.set(key, value);
    }

    public Remove(key: TKey): boolean
    {
        if (this.ContainsKey(key))
        {
            this._map.delete(key);
            return true;
        }
        return false;
    }

    public Keys(): Array<TKey>
    {
        return Array.from(this._map.keys());
    }

    public Values(): Array<TValue>
    {
        return Array.from(this._map.values());
    }

    public ContainsKey(key: TKey): boolean
    {
        return this._map.has(key);
    }

    public TryGet(key: TKey): TValue
    {
        if (this.ContainsKey(key))
        {
            return this.MustGet(key);
        }
        return null;
    }

    public MustGet(key: TKey): TValue
    {
        return this._map.get(key);
    }
}