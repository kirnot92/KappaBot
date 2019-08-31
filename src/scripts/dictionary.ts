
export default class Dictionary<TKey, TValue>
{
    _map: Map<TKey,TValue> = new Map<TKey,  TValue>();

    constructor(init?: { key: TKey; value: TValue; }[])
    {
        if (init == null) { return }

        for (var x = 0; x < init.length; x++)
        {
            var component = init[x];
            this.Add(component.key, component.value);
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
        var iterator = this._map.keys();
        return this.ToArray(iterator);
    }

    public Values(): Array<TValue>
    {
        var iterator = this._map.values();
        return this.ToArray(iterator);
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

    private ToArray<TIterValue>(iterator: IterableIterator<TIterValue>): Array<TIterValue>
    {
        var values = new Array<TIterValue>();
        while (true)
        {
            var comp = iterator.next();
            if (comp.done) { break; }
            values.push(comp.value);
        }
        return values;
    }
}