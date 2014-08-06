table-drag
==========

Adds basic functionality to html tables: dragging.

###Samples

See [here](http://irhc.github.io/table-drag) for some samples. Its a pain in the ass to get it working with all popular render engines. At least it is fully working with Blink and Gecko (e.g. latest versions of Chrome, Opera, Safari, etc.), minor issus (vertical alignment) with Webkit (e.g. Firefox) , but Trident is really hard to hack (missing computed styles, missing rendered sizes, floating point sizes, etc.): comments are very welcome.

###Description

table-drag is a small javascript component which adds basic functionality to html tables: dragging. It is completely independent from other javascript libraries but should work side-by-side with libraries like jQuery, etc.

Any html tables which have at least one tr tag can be used (a thead or tbody tag is not mandatory), e.g.

```html
<table id="example">
    <tbody>
        <tr>
            <th>Name</th>
            <th>&Auml;nderungsdatum</th>
            <th>Typ</th>
            <th>Gr&ouml;&szlig;e</th>
        </tr>
        <tr>
            <td>libraries</td>
            <td>08.10.2013 12:38</td>
            <td>Dateiordner</td>
            <td></td>
        </tr>
        <tr>
            <td>views</td>
            <td>08.10.2013 12:38</td>
            <td>Dateiordner</td>
            <td></td>
        </tr>
        <tr>
            <td>css</td>
            <td>18.05.2014 11:08</td>
            <td>Dateiordner</td>
            <td></td>
        </tr>
        <tr>
            <td>.htaccess</td>
            <td>03.06.2013 14:29</td>
            <td>HTACCESS-Datei</td>
            <td>1 KB</td>
        </tr>
        <tr>
            <td>config.php</td>
            <td>03.06.2013 14:29</td>
            <td>PHP-Datei</td>
            <td>3 KB</td>
        </tr>
        <tr>
            <td>blank.html</td>
            <td>18.05.2014 11:08</td>
            <td>HTLM-Datei</td>
            <td>1 KB</td>
        </tr>
    </tbody>
</table>
```

###How to use

Just before the end of your body section put

```html
<script src='table-drag.min.js'></script>
<script>
  new TableDrag(document.getElementById('example'));
</script>
```

###References

This small javascript component uses or is based on other javascript projects and code snippets:

- [jquery dragtable by akottr](http://akottr.github.io/dragtable/)
- [dragtable: Visually reorder all your table columns](http://www.danvk.org/wp/dragtable/)
- [mouse.js by jQuery](https://github.com/jquery/jquery-ui/blob/master/ui/mouse.js)
- [Reordering arrays on stackoverflow](http://stackoverflow.com/questions/2440700/reordering-arrays)
- [addEvent() recoding contest entry](http://ejohn.org/apps/jselect/event.html)
- [Coordinates](http://javascript.info/tutorial/coordinates)
- [Swapping table columns](https://groups.google.com/forum/#!msg/comp.lang.javascript/durZ17iSD0I/rnH2FqrvkooJ)

### Licence

MIT

