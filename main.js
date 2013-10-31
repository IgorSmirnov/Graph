var Items = [];
var MouseObject = null;
var SelRect = null;
var ctx = null;
var canvas = null;

function DownUp(Down, Up)
{
    this.d = Down;
    this.u = Up;
}

var Main = {
    Scale: 1.0,
    OffsetX: 0.0,
    OffsetY: 0.0,
    LastX: 0.0,
    LastY: 0.0,
    NeedRedraw: false,
    MouseDown: null,
    OnRightDown: null,
    MX: 0, MY: 0,
    SMouseMove: [],
    SMouseLeft: [],
    SMouseRight: [],
    SRedraw: [],
    OnInit:[],
    SetRedraw:function(Redraw){Main.SRedraw.push(Main.Redraw); Main.Redraw = Redraw;},
    PopRedraw:function(){Main.Redraw = Main.SRedraw.pop();},
    SetMouseMove:function(OnMouseMove){Main.SMouseMove.push(Main.OnMouseMove); Main.OnMouseMove = OnMouseMove;},
    PopMouseMove:function(){Main.OnMouseMove = Main.SMouseMove.pop();},
    SetMouseLeft:function(OnDown, OnUp)
    {
        Main.SMouseLeft.push(new DownUp(Main.OnLeftDown, Main.OnLeftUp));
        Main.OnLeftDown = OnDown;
        Main.OnLeftUp = OnUp;
    },
    PopMouseLeft:function()
    {
        var ud = Main.SMouseLeft.pop();
        Main.OnLeftDown = ud.d;
        Main.OnLeftUp = ud.u;
    },
    SetMouseRight:function(OnDown, OnUp)
    {
        Main.SMouseRight.push(new DownUp(Main.OnRightDown, Main.OnRightUp));
        Main.OnRightDown = OnDown;
        Main.OnRightUp = OnUp;
    },
    PopMouseRight:function()
    {
        var ud = Main.SMouseRight.pop();
        Main.OnRightDown = ud.d;
        Main.OnRightUp = ud.u;
    },
    Clear: function()
    {
        ctx.clearRect(-Main.OffsetX / Main.Scale, -Main.OffsetY / Main.Scale, canvas.width / Main.Scale, canvas.height / Main.Scale);
    },
    Redraw: function()
    {
        Main.Clear();
        for(var x = 0; x < Items.length; x++)
        {
            var f = Items[x];
            f.Draw((f == MouseObject) ? 1 : 0);
        }
        //ctx.stroke();
        ctx.strokeStyle = "#8080FF";
        //if(SelRect) SelRect.Stroke();
    },
    Delete: function()
    {
        var x, y;
        for(x = 0, y = 0; x < Items.length; x++)
            if(!Items[x].GetPSel()) Items[y++] = Items[x];
        Items.length = y;
        Main.Redraw();
    },
    OnLeftDown:function(x, y)
    {
        Main.MX = x;
        Main.MY = y;
        SelRect = new SimpleRect(Main.MX, Main.MY, 0, 0);
        Main.SetMouseMove(MouseObject ? Main.OnObjMove : Main.OnSelMove);
    },
    OnFreeMove:function(mx, my) // Свободное движение мыши
    {
        var mo = null;
        for(x = 0; x < Items.length; x++) if(Items[x].Hit(mx, my))
        {
            mo = Items[x];
            break;
        }
        if(MouseObject != mo){MouseObject = mo; Main.NeedRedraw = true;}
    },
    OnAlignedMove:function(mx, my) // Движение с привязкой к объектам
    {
        var mo = null;
        for(x = 0; x < Items.length; x++) if(Items[x].Hit(mx, my))
        {
            mo = Items[x];
            break;
        }
        if(Main.EveryRedraw || MouseObject != mo){MouseObject = mo; Main.NeedRedraw = true;}
    },
    OnMouseMove: null,
    OnLeftUp: function(mx, my)
    {
        if(SelRect && SelRect.x == Main.MX && SelRect.y == Main.MY)
        {
            if(MouseObject)
            {
                if(MouseObject.OnSel) MouseObject.OnSel(!MouseObject.Sel);
                MouseObject.Sel = !MouseObject.Sel;
            }
            else for(var x = 0; x < Items.length; x++)
            {
                if(Items[x].OnSel && Items[x].Sel) Items[x].OnSel(false);
                Items[x].Sel = false;
            }
        }

        SelRect = null;
        Main.PopMouseMove();
        Main.NeedRedraw = true;
    },
    OnObjMove: function(mx, my) // Перемещение объектов с левой кнопкой
    {
        var dx = mx - Main.MX;
        var dy = my - Main.MY;
        Main.MX = mx;
        Main.MY = my;
        var x;
        if(!MouseObject.Sel)
        {
            for(x = 0; x < Items.length; x++) Items[x].Sel = false;
            MouseObject.Sel = true;
        }
        for(x = 0; x < Items.length; x++) if(Items[x].Sel) Items[x].MoveBy(dx, dy);
        for(x = 0; x < Items.length; x++) Items[x].Moved = false;
        Main.NeedRedraw = true;
    },
    OnSelMove: function(x, y) // Перемещение рамки выделения
    {
        SelRect.w = x - SelRect.x;
        SelRect.h = y - SelRect.y;
        Main.NeedRedraw = true;
    },
    Init: function()
    {
        Main.OnMouseMove = Main.OnFreeMove;
        canvas = document.getElementById("canvas");
        canvas.height = 480;
        canvas.width = 640;
        ctx = canvas.getContext('2d');
        canvas.onmousedown = function(evt)
        {
            var b = evt.button;
            Main.MouseDown = b;
            var x = (evt.pageX - canvas.offsetLeft - Main.OffsetX) / Main.Scale;
            var y = (evt.pageY - canvas.offsetTop - Main.OffsetY) / Main.Scale;
            switch(b)
            {
                case 0: if(Main.OnLeftDown) Main.OnLeftDown(x, y); break;
                case 2: if(Main.OnRightDown) Main.OnRightDown(x, y); break;
            }
            if(Main.NeedRedraw) {Main.NeedRedraw = false; Main.Redraw();}
        };
        canvas.onmouseup = function(evt)
        {
            var x = (evt.pageX - canvas.offsetLeft - Main.OffsetX) / Main.Scale;
            var y = (evt.pageY - canvas.offsetTop - Main.OffsetY) / Main.Scale;
            switch(Main.MouseDown)
            {
                case 0: if(Main.OnLeftUp) Main.OnLeftUp(x, y); break;
                case 2: if(Main.OnRightUp) Main.OnRightUp(x, y); break;
            }
            Main.MouseDown = null;
            if(Main.NeedRedraw) {Main.NeedRedraw = false; Main.Redraw();}
        };
        canvas.onmousemove = function(evt)
        {
            Main.LastX = (evt.pageX - canvas.offsetLeft - Main.OffsetX) / Main.Scale;
            Main.LastY = (evt.pageY - canvas.offsetTop - Main.OffsetY) / Main.Scale;;
            if(Main.OnMouseMove)
                Main.OnMouseMove(Main.LastX, Main.LastY);
            if(Main.NeedRedraw) {Main.NeedRedraw = false; Main.Redraw();}
        };
        canvas.onkeydown = function()
        {
            alert("kd");

        }
        for(var x = 0; x < Main.OnInit.length; x++)
            Main.OnInit[x](canvas, ctx);
        this.Redraw();
    }
};

function SimpleRect(x, y, w, h)
{
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}