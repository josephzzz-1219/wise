\# Day2 Keyword Check (Demo Safety)



Rule: For each platform, sample 3 keywords and verify the search returns relevant results.



Status:

\- PASS: relevant items returned (including size/pack variant)

\- WARN: no/irrelevant results, keyword should be adjusted



\## WELLCOME (3 checks)

1\) Product Code: P\_DEMO\_001 | keyword: Lion 洁白物语洗衣液 1L | Status: PASS | Notes: found relevant item; size variant shown (1.8L)

2\) Product Code: P\_DEMO\_002 | keyword: Garden 孖宝蛋糕 2件装 | Status: WARN | Notes: no results

3\) Product Code: P\_DEMO\_003 | keyword: Nissin 出前一丁 麻油味 1包 | Status: PASS | Notes: found relevant item; pack form differs (bowl vs bag)



\## PARKnSHOP (3 checks)

1\) Product Code: P\_DEMO\_001 | keyword: Lion 洁白物语洗衣液 1L | Status: PASS | Notes: found relevant item; size variant shown (1.8L)

2\) Product Code: P\_DEMO\_002 | keyword: Garden 孖宝蛋糕 2件装 | Status: WARN | Notes: no results

3\) Product Code: P\_DEMO\_003 | keyword: Nissin 出前一丁 麻油味 1包 | Status: WARN | Notes: no results



\## MARKET PLACE (JASONS) (3 checks)

1\) Product Code: P\_DEMO\_001 | keyword: Lion 洁白物语洗衣液 1L | Status: PASS | Notes: found relevant item; size variant shown (1.8L)

2\) Product Code: P\_DEMO\_002 | keyword: Garden 孖宝蛋糕 2件装 | Status: WARN | Notes: no results

3\) Product Code: P\_DEMO\_003 | keyword: Nissin 出前一丁 麻油味 1包 | Status: PASS | Notes: found relevant item; pack form differs (bowl vs bag)



\## Keyword adjustments (fallback plan)

Fallback rule (apply in order):

1\) Remove spec (size/pack count)

2\) Use local language brand + product line name (Traditional Chinese)

3\) Use category-level keyword



\- Old keyword: Garden 孖宝蛋糕 2件装 -> New keyword: 嘉頓孖寶蛋糕 | Reason: remove spec; use local brand name

\- Old keyword: Nissin 出前一丁 麻油味 1包 -> New keyword: 出前一丁 麻油味 | Reason: remove pack spec; shorten keyword



\## Note on mismatch

For demo, platform search may return the same product line with different sizes or pack forms. This is acceptable for Week1 because the goal is to validate the "search and redirect" flow. Later, we will normalize size/pack fields and support variant selection.



