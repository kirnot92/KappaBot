
export default class Dictionary<TKey, TValue>
{
    _keys: Array<TKey> = new Array<TKey>();
    _values: Array<TValue> = new Array<TValue>();

    constructor(init?: { key: TKey; value: TValue; }[])
    {
        if (init == null) { return }

        for (var x = 0; x < init.length; x++)
        {
            this._keys.push(init[x].key);
            this._values.push(init[x].value);
        }
    }

    Add(key: TKey, value: TValue)
    {
        this._keys.push(key);
        this._values.push(value);
    }

    Remove(key: TKey)
    {
        var index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
    }

    Keys(): TKey[]
    {
        return this._keys;
    }

    Values(): TValue[]
    {
        return this._values;
    }

    ContainsKey(key: TKey): boolean
    {
        if (this._keys.indexOf(key) == -1)
        {
            return false;
        }
        return true;
    }

    TryGet(key: TKey): TValue
    {
        if (this.ContainsKey(key))
        {
            return this.MustGet(key)
        }
        return null
    }

    MustGet(key: TKey): TValue
    {
        return this._values[this._keys.indexOf(key)];
    }
}