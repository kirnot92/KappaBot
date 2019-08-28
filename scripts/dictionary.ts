
export default class Dictionary<TKey, TValue>
{
    _map: Map<TKey,TValue> = new Map<TKey,  TValue>();
    _keys: Array<TKey> = new Array<TKey>();
    _values: Array<TValue> = new Array<TValue>();

    constructor(init?: { key: TKey; value: TValue; }[])
    {
        if (init == null) { return }

        for (var x = 0; x < init.length; x++)
        {
            var component = init[x];
            this.Add(component.key, component.value);
        }
    }

    Add(key: TKey, value: TValue)
    {
        this._map.set(key, value);
    }

    Remove(key: TKey)
    {
        this._map.delete(key);
    }

    Keys(): IterableIterator<TKey>
    {
        return this._map.keys();
    }

    Values(): TValue[]
    {
        var iter = this._map.values();
        var values = new Array<TValue>();
        while(true)
        {
            var comp = iter.next();
            values.push(comp.value);
            if(comp.done){break;}
        }
        return values;
    }

    ContainsKey(key: TKey): boolean
    {
        return this._map.has(key);
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
        return this._map.get(key);
    }
}