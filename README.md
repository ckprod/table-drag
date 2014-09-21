table-drag
==========

Adds basic functionality to html tables: dragging.

###Samples

See [here](http://irhc.github.io/table-drag) for some samples. Its a pain in the ass to get it working with all popular render engines; uncommon table layouts will eventually not work perfectly.

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

###Features

You can pass in options as a second parameter

```html
  new TableDrag(document.getElementById('example'), { distance: 0, restoreState: true });
```

**distance**

To distinguish between click and drag one can set the minimum drag distance. 
Starting from the mouse down event (e.g. the user presses the left mouse button) there is a virtual cirlce. 
Within it the mouse has to move after the mouse down event

How does dragtable distinguish a click from a drag?

This should only be relevant if you’re using dragtable together with sorttable. 
If a user clicks a column header and then moves the mouse some amount, dragtable assumes they want to rearrange the columns. 
If they don’t move the mouse very much, dragtable considers it a click and sorttable will take it as a cue to sort on that column. T
he exact cutoff is a 10 pixel radius, but you can customize this by calling:

dragtable.setMinDragDistance(5);

somewhere on your page.


**restoreState**

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

