const korBegin = 44032;
const korEnd = 55203;
const chosungBase = 588;
const jungsungBase = 28;
const jaumBegin = 12593;
const jaumEnd = 12622;
const mounBegin = 12623;
const moumEnd = 12643;
const chosung_list = [ 'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ' , 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const jungsung_list = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const jongsung_list = [' ', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const jaum_list = ['ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const moum_list = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];

// https://lovit.github.io/nlp/2018/08/28/levenshtein_hangle/
export default class Levenshtein
{
    Compose(chosung:string , jungsung:string, jongsung:string)
    {
        var char = String.fromCharCode(
            korBegin +
            chosungBase * chosung_list.indexOf(chosung) +
            jungsungBase * jungsung_list.indexOf(jungsung) +
            jongsung_list.indexOf(jongsung));
        return char;
    }

    Decompose(c:string): string
    {
        var i = c.charCodeAt(0);
        if (jaumBegin <= i && i <= jaumEnd) { return c + " " + " " }
        if (mounBegin <= i && i<= moumEnd)  { return " " + c + " " }

        i -= korBegin;
        var cho  = Math.floor(i/chosungBase);
        var jung = Math.floor(( i - cho * chosungBase )/ jungsungBase);
        var jong = ( i - cho * chosungBase - jung * jungsungBase);
        return chosung_list[cho]+ jungsung_list[jung]+ jongsung_list[jong];
    }

    CalculateSubstitutionCost(c1: string, c2:string)
    {
        if (c1[0] == c2[0]) {return 0;}
        return this.GetDistanceInternal(this.Decompose(c1), this.Decompose(c2))/3
    }
    
    GetDistanceInternal(s1: string, s2:string)
    {
        if (s1.length < s2.length) { this.GetDistanceInternal(s2, s1); }
        if (s2.length == 0) { return s1.length; }

        var prevRow = new Array<number>(s2.length + 1);
        for(var x = 0; x< prevRow.length; ++x)
        {
            prevRow[x] = 0;
        }

        for (var i=0; i<s1.length; ++i)
        {
            var currRow = new Array<number>();
            currRow.push(i+1);
            for (var k=0; k<s2.length; ++k)
            {
                var c1 = s1[i];
                var c2 = s2[k];

                var insertions = prevRow[k+1] + 1;
                var deletions = currRow[k] + 1;
                var substitutions = prevRow[k] + ((c1 != c2) ? 1 : 0);

                currRow.push(Math.min(insertions, deletions, substitutions));
            }

            prevRow = currRow;
        }

        return prevRow[prevRow.length-1];
    }

    GetDistance(s1:string, s2 :string)
    {
        if (s1.length < s2.length) { this.GetDistance(s2, s1); }
        if (s2.length == 0) { return s1.length; }
        
        var prevRow = new Array<number>(s2.length + 1);
        for(var x = 0; x< prevRow.length; ++x)
        {
            prevRow[x] = 0;
        }

        for (var i=0; i<s1.length; ++i)
        {
            var currRow = new Array<number>();
            currRow.push(i+1);
            for (var k=0; k<s2.length; ++k)
            {
                var c1 = s1[i];
                var c2 = s2[k];

                var insertions = prevRow[k+1] + 1;
                var deletions = currRow[k] + 1;
                var substitutions = prevRow[k] + this.CalculateSubstitutionCost(c1, c2)

                currRow.push(Math.min(insertions, deletions, substitutions));
            }

            prevRow = currRow;
        }

        return prevRow[prevRow.length-1];
    }
}


// console.log(HangulLevenshtein("하이염", "하이여")); // 거리 = 0.333
// console.log(HangulLevenshtein("하이염", "하이ㅇ")); // 거리 = 0.666