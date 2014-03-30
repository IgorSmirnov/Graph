var Navi =
{
    OnMove: function(mx, my)
    {
        Main.OffsetX += mx * Main.Scale - Main.MX;
        Main.OffsetY += my * Main.Scale - Main.MY;
        ctx.setTransform(Main.Scale, 0, 0, Main.Scale, Main.OffsetX, Main.OffsetY);
        Main.Redraw();
    },
    OnMouseWheel: function(evt)
    {
        var mp = Main.GetMousePos(evt);
        var e = /*window.event ||*/ evt; // old IE support
        e.preventDefault();
        var delta = e.wheelDelta || -e.detail;
        var OScale = Main.Scale;
        if(delta == 0) return;
        if(delta > 0) Main.Scale *= 1.2;
        else Main.Scale /= 1.2;
        OScale -= Main.Scale;
        Main.OffsetX += mp.x * OScale;
        Main.OffsetY += mp.y * OScale;
        //ctx.strokeRect(Main.LastX, Main.LastY, 2, 2);
        ctx.setTransform(Main.Scale, 0, 0, Main.Scale, Main.OffsetX, Main.OffsetY);
        //ctx.strokeRect(Main.LastX, Main.LastY, 2, 2);
        Main.Redraw();
    },
    OnInit: function(canvas, ctx)
    {
        //Main.SetMouseRight(Navi.OnRightDown, Navi.OnRightUp);
        States.free.rightdown = function(x, y)
        {
            Main.MX = x * Main.Scale;
            Main.MY = y * Main.Scale;
            Main.Call(States.navi);
        },

        States.navi = { move: Navi.OnMove, rightup: Main.Pop};
        if (canvas.addEventListener) {
            // IE9, Chrome, Safari, Opera
            canvas.addEventListener("mousewheel", Navi.OnMouseWheel, false);
            // Firefox
            canvas.addEventListener("DOMMouseScroll", Navi.OnMouseWheel, false);
        }else canvas.attachEvent("onmousewheel", Navi.OnMouseWheel);
    }
};

Main.Modules.push(Navi);