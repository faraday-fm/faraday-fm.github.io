let MO = 0, Be = class {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
};
class X {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = MO++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    });
  }
  /**
  This is meant to be used with
  [`NodeSet.extend`](#common.NodeSet.extend) or
  [`LRParser.configure`](#lr.ParserConfig.props) to compute
  prop values for each node type in the set. Takes a [match
  object](#common.NodeType^match) or function that returns undefined
  if the node type doesn't get this prop, and the prop's value if
  it does.
  */
  add(e) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    return typeof e != "function" && (e = ae.match(e)), (t) => {
      let i = e(t);
      return i === void 0 ? null : [this, i];
    };
  }
}
X.closedBy = new X({ deserialize: (r) => r.split(" ") });
X.openedBy = new X({ deserialize: (r) => r.split(" ") });
X.group = new X({ deserialize: (r) => r.split(" ") });
X.isolate = new X({ deserialize: (r) => {
  if (r && r != "rtl" && r != "ltr" && r != "auto")
    throw new RangeError("Invalid value for isolate: " + r);
  return r || "auto";
} });
X.contextHash = new X({ perNode: !0 });
X.lookAhead = new X({ perNode: !0 });
X.mounted = new X({ perNode: !0 });
class ir {
  constructor(e, t, i) {
    this.tree = e, this.overlay = t, this.parser = i;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[X.mounted.id];
  }
}
const EO = /* @__PURE__ */ Object.create(null);
class ae {
  /**
  @internal
  */
  constructor(e, t, i, n = 0) {
    this.name = e, this.props = t, this.id = i, this.flags = n;
  }
  /**
  Define a node type.
  */
  static define(e) {
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : EO, i = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), n = new ae(e.name || "", t, e.id, i);
    if (e.props) {
      for (let s of e.props)
        if (Array.isArray(s) || (s = s(n)), s) {
          if (s[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          t[s[0].id] = s[1];
        }
    }
    return n;
  }
  /**
  Retrieves a node prop for this type. Will return `undefined` if
  the prop isn't present on this node.
  */
  prop(e) {
    return this.props[e.id];
  }
  /**
  True when this is the top node of a grammar.
  */
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /**
  True when this node is produced by a skip rule.
  */
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /**
  Indicates whether this is an error node.
  */
  get isError() {
    return (this.flags & 4) > 0;
  }
  /**
  When true, this node type doesn't correspond to a user-declared
  named node, for example because it is used to cache repetition.
  */
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /**
  Returns true when this node's name or one of its
  [groups](#common.NodeProp^group) matches the given string.
  */
  is(e) {
    if (typeof e == "string") {
      if (this.name == e)
        return !0;
      let t = this.prop(X.group);
      return t ? t.indexOf(e) > -1 : !1;
    }
    return this.id == e;
  }
  /**
  Create a function from node types to arbitrary values by
  specifying an object whose property names are node or
  [group](#common.NodeProp^group) names. Often useful with
  [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  names, separated by spaces, in a single property name to map
  multiple node names to a single value.
  */
  static match(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let i in e)
      for (let n of i.split(" "))
        t[n] = e[i];
    return (i) => {
      for (let n = i.prop(X.group), s = -1; s < (n ? n.length : 0); s++) {
        let o = t[s < 0 ? i.name : n[s]];
        if (o)
          return o;
      }
    };
  }
}
ae.none = new ae(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class $r {
  /**
  Create a set with the given types. The `id` property of each
  type should correspond to its position within the array.
  */
  constructor(e) {
    this.types = e;
    for (let t = 0; t < e.length; t++)
      if (e[t].id != t)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  /**
  Create a copy of this set with some node properties added. The
  arguments to this method can be created with
  [`NodeProp.add`](#common.NodeProp.add).
  */
  extend(...e) {
    let t = [];
    for (let i of this.types) {
      let n = null;
      for (let s of e) {
        let o = s(i);
        o && (n || (n = Object.assign({}, i.props)), n[o[0].id] = o[1]);
      }
      t.push(n ? new ae(i.name, n, i.id, i.flags) : i);
    }
    return new $r(t);
  }
}
const qr = /* @__PURE__ */ new WeakMap(), jl = /* @__PURE__ */ new WeakMap();
var F;
(function(r) {
  r[r.ExcludeBuffers = 1] = "ExcludeBuffers", r[r.IncludeAnonymous = 2] = "IncludeAnonymous", r[r.IgnoreMounts = 4] = "IgnoreMounts", r[r.IgnoreOverlays = 8] = "IgnoreOverlays";
})(F || (F = {}));
class _ {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(e, t, i, n, s) {
    if (this.type = e, this.children = t, this.positions = i, this.length = n, this.props = null, s && s.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [o, l] of s)
        this.props[typeof o == "number" ? o : o.id] = l;
    }
  }
  /**
  @internal
  */
  toString() {
    let e = ir.get(this);
    if (e && !e.overlay)
      return e.tree.toString();
    let t = "";
    for (let i of this.children) {
      let n = i.toString();
      n && (t && (t += ","), t += n);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (t.length ? "(" + t + ")" : "") : t;
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(e = 0) {
    return new Qn(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, i = 0) {
    let n = qr.get(this) || this.topNode, s = new Qn(n);
    return s.moveTo(e, t), qr.set(this, s._tree), s;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new be(this, 0, 0, null);
  }
  /**
  Get the [syntax node](#common.SyntaxNode) at the given position.
  If `side` is -1, this will move into nodes that end at the
  position. If 1, it'll move into nodes that start at the
  position. With 0, it'll only enter nodes that cover the position
  from both sides.
  
  Note that this will not enter
  [overlays](#common.MountedTree.overlay), and you often want
  [`resolveInner`](#common.Tree.resolveInner) instead.
  */
  resolve(e, t = 0) {
    let i = rr(qr.get(this) || this.topNode, e, t, !1);
    return qr.set(this, i), i;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let i = rr(jl.get(this) || this.topNode, e, t, !0);
    return jl.set(this, i), i;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return DO(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: i, from: n = 0, to: s = this.length } = e, o = e.mode || 0, l = (o & F.IncludeAnonymous) > 0;
    for (let a = this.cursor(o | F.IncludeAnonymous); ; ) {
      let h = !1;
      if (a.from <= s && a.to >= n && (!l && a.type.isAnonymous || t(a) !== !1)) {
        if (a.firstChild())
          continue;
        h = !0;
      }
      for (; h && i && (l || !a.type.isAnonymous) && i(a), !a.nextSibling(); ) {
        if (!a.parent())
          return;
        h = !0;
      }
    }
  }
  /**
  Get the value of the given [node prop](#common.NodeProp) for this
  node. Works with both per-node and per-type props.
  */
  prop(e) {
    return e.perNode ? this.props ? this.props[e.id] : void 0 : this.type.prop(e);
  }
  /**
  Returns the node's [per-node props](#common.NodeProp.perNode) in a
  format that can be passed to the [`Tree`](#common.Tree)
  constructor.
  */
  get propValues() {
    let e = [];
    if (this.props)
      for (let t in this.props)
        e.push([+t, this.props[t]]);
    return e;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(e = {}) {
    return this.children.length <= 8 ? this : tl(ae.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, i, n) => new _(this.type, t, i, n, this.propValues), e.makeTree || ((t, i, n) => new _(ae.none, t, i, n)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return qO(e);
  }
}
_.empty = new _(ae.none, [], [], 0);
class Jo {
  constructor(e, t) {
    this.buffer = e, this.index = t;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new Jo(this.buffer, this.index);
  }
}
class Mt {
  /**
  Create a tree buffer.
  */
  constructor(e, t, i) {
    this.buffer = e, this.length = t, this.set = i;
  }
  /**
  @internal
  */
  get type() {
    return ae.none;
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    for (let t = 0; t < this.buffer.length; )
      e.push(this.childString(t)), t = this.buffer[t + 3];
    return e.join(",");
  }
  /**
  @internal
  */
  childString(e) {
    let t = this.buffer[e], i = this.buffer[e + 3], n = this.set.types[t], s = n.name;
    if (/\W/.test(s) && !n.isError && (s = JSON.stringify(s)), e += 4, i == e)
      return s;
    let o = [];
    for (; e < i; )
      o.push(this.childString(e)), e = this.buffer[e + 3];
    return s + "(" + o.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(e, t, i, n, s) {
    let { buffer: o } = this, l = -1;
    for (let a = e; a != t && !(Pc(s, n, o[a + 1], o[a + 2]) && (l = a, i > 0)); a = o[a + 3])
      ;
    return l;
  }
  /**
  @internal
  */
  slice(e, t, i) {
    let n = this.buffer, s = new Uint16Array(t - e), o = 0;
    for (let l = e, a = 0; l < t; ) {
      s[a++] = n[l++], s[a++] = n[l++] - i;
      let h = s[a++] = n[l++] - i;
      s[a++] = n[l++] - e, o = Math.max(o, h);
    }
    return new Mt(s, o, this.set);
  }
}
function Pc(r, e, t, i) {
  switch (r) {
    case -2:
      return t < e;
    case -1:
      return i >= e && t < e;
    case 0:
      return t < e && i > e;
    case 1:
      return t <= e && i > e;
    case 2:
      return i > e;
    case 4:
      return !0;
  }
}
function rr(r, e, t, i) {
  for (var n; r.from == r.to || (t < 1 ? r.from >= e : r.from > e) || (t > -1 ? r.to <= e : r.to < e); ) {
    let o = !i && r instanceof be && r.index < 0 ? null : r.parent;
    if (!o)
      return r;
    r = o;
  }
  let s = i ? 0 : F.IgnoreOverlays;
  if (i)
    for (let o = r, l = o.parent; l; o = l, l = o.parent)
      o instanceof be && o.index < 0 && ((n = l.enter(e, t, s)) === null || n === void 0 ? void 0 : n.from) != o.from && (r = l);
  for (; ; ) {
    let o = r.enter(e, t, s);
    if (!o)
      return r;
    r = o;
  }
}
class $c {
  cursor(e = 0) {
    return new Qn(this, e);
  }
  getChild(e, t = null, i = null) {
    let n = Gl(this, e, t, i);
    return n.length ? n[0] : null;
  }
  getChildren(e, t = null, i = null) {
    return Gl(this, e, t, i);
  }
  resolve(e, t = 0) {
    return rr(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return rr(this, e, t, !0);
  }
  matchContext(e) {
    return Is(this, e);
  }
  enterUnfinishedNodesBefore(e) {
    let t = this.childBefore(e), i = this;
    for (; t; ) {
      let n = t.lastChild;
      if (!n || n.to != t.to)
        break;
      n.type.isError && n.from == n.to ? (i = t, t = n.prevSibling) : t = n;
    }
    return i;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
}
class be extends $c {
  constructor(e, t, i, n) {
    super(), this._tree = e, this.from = t, this.index = i, this._parent = n;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(e, t, i, n, s = 0) {
    for (let o = this; ; ) {
      for (let { children: l, positions: a } = o._tree, h = t > 0 ? l.length : -1; e != h; e += t) {
        let c = l[e], f = a[e] + o.from;
        if (Pc(n, i, f, f + c.length)) {
          if (c instanceof Mt) {
            if (s & F.ExcludeBuffers)
              continue;
            let d = c.findChild(0, c.buffer.length, t, i - f, n);
            if (d > -1)
              return new lt(new WO(o, c, e, f), null, d);
          } else if (s & F.IncludeAnonymous || !c.type.isAnonymous || el(c)) {
            let d;
            if (!(s & F.IgnoreMounts) && (d = ir.get(c)) && !d.overlay)
              return new be(d.tree, f, e, o);
            let O = new be(c, f, e, o);
            return s & F.IncludeAnonymous || !O.type.isAnonymous ? O : O.nextChild(t < 0 ? c.children.length - 1 : 0, t, i, n);
          }
        }
      }
      if (s & F.IncludeAnonymous || !o.type.isAnonymous || (o.index >= 0 ? e = o.index + t : e = t < 0 ? -1 : o._parent._tree.children.length, o = o._parent, !o))
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.nextChild(
      0,
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  enter(e, t, i = 0) {
    let n;
    if (!(i & F.IgnoreOverlays) && (n = ir.get(this._tree)) && n.overlay) {
      let s = e - this.from;
      for (let { from: o, to: l } of n.overlay)
        if ((t > 0 ? o <= s : o < s) && (t < 0 ? l >= s : l > s))
          return new be(n.tree, n.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, e, t, i);
  }
  nextSignificantParent() {
    let e = this;
    for (; e.type.isAnonymous && e._parent; )
      e = e._parent;
    return e;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  /**
  @internal
  */
  toString() {
    return this._tree.toString();
  }
}
function Gl(r, e, t, i) {
  let n = r.cursor(), s = [];
  if (!n.firstChild())
    return s;
  if (t != null) {
    for (let o = !1; !o; )
      if (o = n.type.is(t), !n.nextSibling())
        return s;
  }
  for (; ; ) {
    if (i != null && n.type.is(i))
      return s;
    if (n.type.is(e) && s.push(n.node), !n.nextSibling())
      return i == null ? s : [];
  }
}
function Is(r, e, t = e.length - 1) {
  for (let i = r.parent; t >= 0; i = i.parent) {
    if (!i)
      return !1;
    if (!i.type.isAnonymous) {
      if (e[t] && e[t] != i.name)
        return !1;
      t--;
    }
  }
  return !0;
}
class WO {
  constructor(e, t, i, n) {
    this.parent = e, this.buffer = t, this.index = i, this.start = n;
  }
}
class lt extends $c {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(e, t, i) {
    super(), this.context = e, this._parent = t, this.index = i, this.type = e.buffer.set.types[e.buffer.buffer[i]];
  }
  child(e, t, i) {
    let { buffer: n } = this.context, s = n.findChild(this.index + 4, n.buffer[this.index + 3], e, t - this.context.start, i);
    return s < 0 ? null : new lt(this.context, this, s);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.child(
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.child(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  enter(e, t, i = 0) {
    if (i & F.ExcludeBuffers)
      return null;
    let { buffer: n } = this.context, s = n.findChild(this.index + 4, n.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return s < 0 ? null : new lt(this.context, this, s);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(e) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + e,
      e,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer: e } = this.context, t = e.buffer[this.index + 3];
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new lt(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new lt(this.context, this._parent, e.findChild(
      t,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  get tree() {
    return null;
  }
  toTree() {
    let e = [], t = [], { buffer: i } = this.context, n = this.index + 4, s = i.buffer[this.index + 3];
    if (s > n) {
      let o = i.buffer[this.index + 1];
      e.push(i.slice(n, s, o)), t.push(0);
    }
    return new _(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function vc(r) {
  if (!r.length)
    return null;
  let e = 0, t = r[0];
  for (let s = 1; s < r.length; s++) {
    let o = r[s];
    (o.from > t.from || o.to < t.to) && (t = o, e = s);
  }
  let i = t instanceof be && t.index < 0 ? null : t.parent, n = r.slice();
  return i ? n[e] = i : n.splice(e, 1), new YO(n, t);
}
class YO {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return vc(this.heads);
  }
}
function DO(r, e, t) {
  let i = r.resolveInner(e, t), n = null;
  for (let s = i instanceof be ? i : i.context.parent; s; s = s.parent)
    if (s.index < 0) {
      let o = s.parent;
      (n || (n = [i])).push(o.resolve(e, t)), s = o;
    } else {
      let o = ir.get(s.tree);
      if (o && o.overlay && o.overlay[0].from <= e && o.overlay[o.overlay.length - 1].to >= e) {
        let l = new be(o.tree, o.overlay[0].from + s.from, -1, s);
        (n || (n = [i])).push(rr(l, e, t, !1));
      }
    }
  return n ? vc(n) : i;
}
class Qn {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(e, t = 0) {
    if (this.mode = t, this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, e instanceof be)
      this.yieldNode(e);
    else {
      this._tree = e.context.parent, this.buffer = e.context;
      for (let i = e._parent; i; i = i._parent)
        this.stack.unshift(i.index);
      this.bufferNode = e, this.yieldBuf(e.index);
    }
  }
  yieldNode(e) {
    return e ? (this._tree = e, this.type = e.type, this.from = e.from, this.to = e.to, !0) : !1;
  }
  yieldBuf(e, t) {
    this.index = e;
    let { start: i, buffer: n } = this.buffer;
    return this.type = t || n.set.types[n.buffer[e]], this.from = i + n.buffer[e + 1], this.to = i + n.buffer[e + 2], !0;
  }
  /**
  @internal
  */
  yield(e) {
    return e ? e instanceof be ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
  }
  /**
  @internal
  */
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /**
  @internal
  */
  enterChild(e, t, i) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(e < 0 ? this._tree._tree.children.length - 1 : 0, e, t, i, this.mode));
    let { buffer: n } = this.buffer, s = n.findChild(this.index + 4, n.buffer[this.index + 3], e, t - this.buffer.start, i);
    return s < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(s));
  }
  /**
  Move the cursor to this node's first child. When this returns
  false, the node has no child, and the cursor has not been moved.
  */
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to this node's last child.
  */
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to the first child that ends after `pos`.
  */
  childAfter(e) {
    return this.enterChild(
      1,
      e,
      2
      /* Side.After */
    );
  }
  /**
  Move to the last child that starts before `pos`.
  */
  childBefore(e) {
    return this.enterChild(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  /**
  Move the cursor to the child around `pos`. If side is -1 the
  child may end at that position, when 1 it may start there. This
  will also enter [overlaid](#common.MountedTree.overlay)
  [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  set to false.
  */
  enter(e, t, i = this.mode) {
    return this.buffer ? i & F.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, i));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & F.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & F.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(e);
  }
  /**
  @internal
  */
  sibling(e) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode)) : !1;
    let { buffer: t } = this.buffer, i = this.stack.length - 1;
    if (e < 0) {
      let n = i < 0 ? 0 : this.stack[i] + 4;
      if (this.index != n)
        return this.yieldBuf(t.findChild(
          n,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let n = t.buffer[this.index + 3];
      if (n < (i < 0 ? t.buffer.length : t.buffer[this.stack[i] + 3]))
        return this.yieldBuf(n);
    }
    return i < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + e, e, 0, 4, this.mode)) : !1;
  }
  /**
  Move to this node's next sibling, if any.
  */
  nextSibling() {
    return this.sibling(1);
  }
  /**
  Move to this node's previous sibling, if any.
  */
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(e) {
    let t, i, { buffer: n } = this;
    if (n) {
      if (e > 0) {
        if (this.index < n.buffer.buffer.length)
          return !1;
      } else
        for (let s = 0; s < this.index; s++)
          if (n.buffer.buffer[s + 3] < this.index)
            return !1;
      ({ index: t, parent: i } = n);
    } else
      ({ index: t, _parent: i } = this._tree);
    for (; i; { index: t, _parent: i } = i)
      if (t > -1)
        for (let s = t + e, o = e < 0 ? -1 : i._tree.children.length; s != o; s += e) {
          let l = i._tree.children[s];
          if (this.mode & F.IncludeAnonymous || l instanceof Mt || !l.type.isAnonymous || el(l))
            return !1;
        }
    return !0;
  }
  move(e, t) {
    if (t && this.enterChild(
      e,
      0,
      4
      /* Side.DontCare */
    ))
      return !0;
    for (; ; ) {
      if (this.sibling(e))
        return !0;
      if (this.atLastNode(e) || !this.parent())
        return !1;
    }
  }
  /**
  Move to the next node in a
  [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  traversal, going from a node to its first child or, if the
  current node is empty or `enter` is false, its next sibling or
  the next sibling of the first parent node that has one.
  */
  next(e = !0) {
    return this.move(1, e);
  }
  /**
  Move to the next node in a last-to-first pre-order traveral. A
  node is followed by its last child or, if it has none, its
  previous sibling or the previous sibling of the first parent
  node that has one.
  */
  prev(e = !0) {
    return this.move(-1, e);
  }
  /**
  Move the cursor to the innermost node that covers `pos`. If
  `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  it will enter nodes that start at `pos`.
  */
  moveTo(e, t = 0) {
    for (; (this.from == this.to || (t < 1 ? this.from >= e : this.from > e) || (t > -1 ? this.to <= e : this.to < e)) && this.parent(); )
      ;
    for (; this.enterChild(1, e, t); )
      ;
    return this;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) at the cursor's current
  position.
  */
  get node() {
    if (!this.buffer)
      return this._tree;
    let e = this.bufferNode, t = null, i = 0;
    if (e && e.context == this.buffer)
      e: for (let n = this.index, s = this.stack.length; s >= 0; ) {
        for (let o = e; o; o = o._parent)
          if (o.index == n) {
            if (n == this.index)
              return o;
            t = o, i = s + 1;
            break e;
          }
        n = this.stack[--s];
      }
    for (let n = i; n < this.stack.length; n++)
      t = new lt(this.buffer, t, this.stack[n]);
    return this.bufferNode = new lt(this.buffer, t, this.index);
  }
  /**
  Get the [tree](#common.Tree) that represents the current node, if
  any. Will return null when the node is in a [tree
  buffer](#common.TreeBuffer).
  */
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /**
  Iterate over the current node and all its descendants, calling
  `enter` when entering a node and `leave`, if given, when leaving
  one. When `enter` returns `false`, any children of that node are
  skipped, and `leave` isn't called for it.
  */
  iterate(e, t) {
    for (let i = 0; ; ) {
      let n = !1;
      if (this.type.isAnonymous || e(this) !== !1) {
        if (this.firstChild()) {
          i++;
          continue;
        }
        this.type.isAnonymous || (n = !0);
      }
      for (; n && t && t(this), n = this.type.isAnonymous, !this.nextSibling(); ) {
        if (!i)
          return;
        this.parent(), i--, n = !0;
      }
    }
  }
  /**
  Test whether the current node matches a given context—a sequence
  of direct parent node names. Empty strings in the context array
  are treated as wildcards.
  */
  matchContext(e) {
    if (!this.buffer)
      return Is(this.node, e);
    let { buffer: t } = this.buffer, { types: i } = t.set;
    for (let n = e.length - 1, s = this.stack.length - 1; n >= 0; s--) {
      if (s < 0)
        return Is(this.node, e, n);
      let o = i[t.buffer[this.stack[s]]];
      if (!o.isAnonymous) {
        if (e[n] && e[n] != o.name)
          return !1;
        n--;
      }
    }
    return !0;
  }
}
function el(r) {
  return r.children.some((e) => e instanceof Mt || !e.type.isAnonymous || el(e));
}
function qO(r) {
  var e;
  let { buffer: t, nodeSet: i, maxBufferLength: n = 1024, reused: s = [], minRepeatType: o = i.types.length } = r, l = Array.isArray(t) ? new Jo(t, t.length) : t, a = i.types, h = 0, c = 0;
  function f(x, v, $, E, D, q) {
    let { id: Y, start: W, end: U, size: N } = l, te = c;
    for (; N < 0; )
      if (l.next(), N == -1) {
        let oe = s[Y];
        $.push(oe), E.push(W - x);
        return;
      } else if (N == -3) {
        h = Y;
        return;
      } else if (N == -4) {
        c = Y;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${N}`);
    let Qe = a[Y], we, Te, Ye = W - x;
    if (U - W <= n && (Te = g(l.pos - v, D))) {
      let oe = new Uint16Array(Te.size - Te.skip), De = l.pos - Te.size, et = oe.length;
      for (; l.pos > De; )
        et = b(Te.start, oe, et);
      we = new Mt(oe, U - Te.start, i), Ye = Te.start - x;
    } else {
      let oe = l.pos - N;
      l.next();
      let De = [], et = [], Vt = Y >= o ? Y : -1, ni = 0, Dr = U;
      for (; l.pos > oe; )
        Vt >= 0 && l.id == Vt && l.size >= 0 ? (l.end <= Dr - n && (p(De, et, W, ni, l.end, Dr, Vt, te), ni = De.length, Dr = l.end), l.next()) : q > 2500 ? d(W, oe, De, et) : f(W, oe, De, et, Vt, q + 1);
      if (Vt >= 0 && ni > 0 && ni < De.length && p(De, et, W, ni, W, Dr, Vt, te), De.reverse(), et.reverse(), Vt > -1 && ni > 0) {
        let Il = O(Qe);
        we = tl(Qe, De, et, 0, De.length, 0, U - W, Il, Il);
      } else
        we = m(Qe, De, et, U - W, te - U);
    }
    $.push(we), E.push(Ye);
  }
  function d(x, v, $, E) {
    let D = [], q = 0, Y = -1;
    for (; l.pos > v; ) {
      let { id: W, start: U, end: N, size: te } = l;
      if (te > 4)
        l.next();
      else {
        if (Y > -1 && U < Y)
          break;
        Y < 0 && (Y = N - n), D.push(W, U, N), q++, l.next();
      }
    }
    if (q) {
      let W = new Uint16Array(q * 4), U = D[D.length - 2];
      for (let N = D.length - 3, te = 0; N >= 0; N -= 3)
        W[te++] = D[N], W[te++] = D[N + 1] - U, W[te++] = D[N + 2] - U, W[te++] = te;
      $.push(new Mt(W, D[2] - U, i)), E.push(U - x);
    }
  }
  function O(x) {
    return (v, $, E) => {
      let D = 0, q = v.length - 1, Y, W;
      if (q >= 0 && (Y = v[q]) instanceof _) {
        if (!q && Y.type == x && Y.length == E)
          return Y;
        (W = Y.prop(X.lookAhead)) && (D = $[q] + Y.length + W);
      }
      return m(x, v, $, E, D);
    };
  }
  function p(x, v, $, E, D, q, Y, W) {
    let U = [], N = [];
    for (; x.length > E; )
      U.push(x.pop()), N.push(v.pop() + $ - D);
    x.push(m(i.types[Y], U, N, q - D, W - q)), v.push(D - $);
  }
  function m(x, v, $, E, D = 0, q) {
    if (h) {
      let Y = [X.contextHash, h];
      q = q ? [Y].concat(q) : [Y];
    }
    if (D > 25) {
      let Y = [X.lookAhead, D];
      q = q ? [Y].concat(q) : [Y];
    }
    return new _(x, v, $, E, q);
  }
  function g(x, v) {
    let $ = l.fork(), E = 0, D = 0, q = 0, Y = $.end - n, W = { size: 0, start: 0, skip: 0 };
    e: for (let U = $.pos - x; $.pos > U; ) {
      let N = $.size;
      if ($.id == v && N >= 0) {
        W.size = E, W.start = D, W.skip = q, q += 4, E += 4, $.next();
        continue;
      }
      let te = $.pos - N;
      if (N < 0 || te < U || $.start < Y)
        break;
      let Qe = $.id >= o ? 4 : 0, we = $.start;
      for ($.next(); $.pos > te; ) {
        if ($.size < 0)
          if ($.size == -3)
            Qe += 4;
          else
            break e;
        else $.id >= o && (Qe += 4);
        $.next();
      }
      D = we, E += N, q += Qe;
    }
    return (v < 0 || E == x) && (W.size = E, W.start = D, W.skip = q), W.size > 4 ? W : void 0;
  }
  function b(x, v, $) {
    let { id: E, start: D, end: q, size: Y } = l;
    if (l.next(), Y >= 0 && E < o) {
      let W = $;
      if (Y > 4) {
        let U = l.pos - (Y - 4);
        for (; l.pos > U; )
          $ = b(x, v, $);
      }
      v[--$] = W, v[--$] = q - x, v[--$] = D - x, v[--$] = E;
    } else Y == -3 ? h = E : Y == -4 && (c = E);
    return $;
  }
  let S = [], k = [];
  for (; l.pos > 0; )
    f(r.start || 0, r.bufferStart || 0, S, k, -1, 0);
  let Q = (e = r.length) !== null && e !== void 0 ? e : S.length ? k[0] + S[0].length : 0;
  return new _(a[r.topID], S.reverse(), k.reverse(), Q);
}
const Fl = /* @__PURE__ */ new WeakMap();
function fn(r, e) {
  if (!r.isAnonymous || e instanceof Mt || e.type != r)
    return 1;
  let t = Fl.get(e);
  if (t == null) {
    t = 1;
    for (let i of e.children) {
      if (i.type != r || !(i instanceof _)) {
        t = 1;
        break;
      }
      t += fn(r, i);
    }
    Fl.set(e, t);
  }
  return t;
}
function tl(r, e, t, i, n, s, o, l, a) {
  let h = 0;
  for (let p = i; p < n; p++)
    h += fn(r, e[p]);
  let c = Math.ceil(
    h * 1.5 / 8
    /* Balance.BranchFactor */
  ), f = [], d = [];
  function O(p, m, g, b, S) {
    for (let k = g; k < b; ) {
      let Q = k, x = m[k], v = fn(r, p[k]);
      for (k++; k < b; k++) {
        let $ = fn(r, p[k]);
        if (v + $ >= c)
          break;
        v += $;
      }
      if (k == Q + 1) {
        if (v > c) {
          let $ = p[Q];
          O($.children, $.positions, 0, $.children.length, m[Q] + S);
          continue;
        }
        f.push(p[Q]);
      } else {
        let $ = m[k - 1] + p[k - 1].length - x;
        f.push(tl(r, p, m, Q, k, x, $, null, a));
      }
      d.push(x + S - s);
    }
  }
  return O(e, t, i, n, 0), (l || a)(f, d, o);
}
class Cc {
  constructor() {
    this.map = /* @__PURE__ */ new WeakMap();
  }
  setBuffer(e, t, i) {
    let n = this.map.get(e);
    n || this.map.set(e, n = /* @__PURE__ */ new Map()), n.set(t, i);
  }
  getBuffer(e, t) {
    let i = this.map.get(e);
    return i && i.get(t);
  }
  /**
  Set the value for this syntax node.
  */
  set(e, t) {
    e instanceof lt ? this.setBuffer(e.context.buffer, e.index, t) : e instanceof be && this.map.set(e.tree, t);
  }
  /**
  Retrieve value for this syntax node, if it exists in the map.
  */
  get(e) {
    return e instanceof lt ? this.getBuffer(e.context.buffer, e.index) : e instanceof be ? this.map.get(e.tree) : void 0;
  }
  /**
  Set the value for the node that a cursor currently points to.
  */
  cursorSet(e, t) {
    e.buffer ? this.setBuffer(e.buffer.buffer, e.index, t) : this.map.set(e.tree, t);
  }
  /**
  Retrieve the value for the node that a cursor currently points
  to.
  */
  cursorGet(e) {
    return e.buffer ? this.getBuffer(e.buffer.buffer, e.index) : this.map.get(e.tree);
  }
}
class pt {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(e, t, i, n, s = !1, o = !1) {
    this.from = e, this.to = t, this.tree = i, this.offset = n, this.open = (s ? 1 : 0) | (o ? 2 : 0);
  }
  /**
  Whether the start of the fragment represents the start of a
  parse, or the end of a change. (In the second case, it may not
  be safe to reuse some nodes at the start, depending on the
  parsing algorithm.)
  */
  get openStart() {
    return (this.open & 1) > 0;
  }
  /**
  Whether the end of the fragment represents the end of a
  full-document parse, or the start of a change.
  */
  get openEnd() {
    return (this.open & 2) > 0;
  }
  /**
  Create a set of fragments from a freshly parsed tree, or update
  an existing set of fragments by replacing the ones that overlap
  with a tree with content from the new tree. When `partial` is
  true, the parse is treated as incomplete, and the resulting
  fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
  true.
  */
  static addTree(e, t = [], i = !1) {
    let n = [new pt(0, e.length, e, 0, !1, i)];
    for (let s of t)
      s.to > e.length && n.push(s);
    return n;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(e, t, i = 128) {
    if (!t.length)
      return e;
    let n = [], s = 1, o = e.length ? e[0] : null;
    for (let l = 0, a = 0, h = 0; ; l++) {
      let c = l < t.length ? t[l] : null, f = c ? c.fromA : 1e9;
      if (f - a >= i)
        for (; o && o.from < f; ) {
          let d = o;
          if (a >= d.from || f <= d.to || h) {
            let O = Math.max(d.from, a) - h, p = Math.min(d.to, f) - h;
            d = O >= p ? null : new pt(O, p, d.tree, d.offset + h, l > 0, !!c);
          }
          if (d && n.push(d), o.to > f)
            break;
          o = s < e.length ? e[s++] : null;
        }
      if (!c)
        break;
      a = c.toA, h = c.toA - c.toB;
    }
    return n;
  }
}
class il {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(e, t, i) {
    return typeof e == "string" && (e = new VO(e)), i = i ? i.length ? i.map((n) => new Be(n.from, n.to)) : [new Be(0, 0)] : [new Be(0, e.length)], this.createParse(e, t || [], i);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(e, t, i) {
    let n = this.startParse(e, t, i);
    for (; ; ) {
      let s = n.advance();
      if (s)
        return s;
    }
  }
}
class VO {
  constructor(e) {
    this.string = e;
  }
  get length() {
    return this.string.length;
  }
  chunk(e) {
    return this.string.slice(e);
  }
  get lineChunks() {
    return !1;
  }
  read(e, t) {
    return this.string.slice(e, t);
  }
}
function Zc(r) {
  return (e, t, i, n) => new zO(e, r, t, i, n);
}
class Hl {
  constructor(e, t, i, n, s) {
    this.parser = e, this.parse = t, this.overlay = i, this.target = n, this.from = s;
  }
}
function Kl(r) {
  if (!r.length || r.some((e) => e.from >= e.to))
    throw new RangeError("Invalid inner parse ranges given: " + JSON.stringify(r));
}
class BO {
  constructor(e, t, i, n, s, o, l) {
    this.parser = e, this.predicate = t, this.mounts = i, this.index = n, this.start = s, this.target = o, this.prev = l, this.depth = 0, this.ranges = [];
  }
}
const js = new X({ perNode: !0 });
class zO {
  constructor(e, t, i, n, s) {
    this.nest = t, this.input = i, this.fragments = n, this.ranges = s, this.inner = [], this.innerDone = 0, this.baseTree = null, this.stoppedAt = null, this.baseParse = e;
  }
  advance() {
    if (this.baseParse) {
      let i = this.baseParse.advance();
      if (!i)
        return null;
      if (this.baseParse = null, this.baseTree = i, this.startInner(), this.stoppedAt != null)
        for (let n of this.inner)
          n.parse.stopAt(this.stoppedAt);
    }
    if (this.innerDone == this.inner.length) {
      let i = this.baseTree;
      return this.stoppedAt != null && (i = new _(i.type, i.children, i.positions, i.length, i.propValues.concat([[js, this.stoppedAt]]))), i;
    }
    let e = this.inner[this.innerDone], t = e.parse.advance();
    if (t) {
      this.innerDone++;
      let i = Object.assign(/* @__PURE__ */ Object.create(null), e.target.props);
      i[X.mounted.id] = new ir(t, e.overlay, e.parser), e.target.props = i;
    }
    return null;
  }
  get parsedPos() {
    if (this.baseParse)
      return 0;
    let e = this.input.length;
    for (let t = this.innerDone; t < this.inner.length; t++)
      this.inner[t].from < e && (e = Math.min(e, this.inner[t].parse.parsedPos));
    return e;
  }
  stopAt(e) {
    if (this.stoppedAt = e, this.baseParse)
      this.baseParse.stopAt(e);
    else
      for (let t = this.innerDone; t < this.inner.length; t++)
        this.inner[t].parse.stopAt(e);
  }
  startInner() {
    let e = new _O(this.fragments), t = null, i = null, n = new Qn(new be(this.baseTree, this.ranges[0].from, 0, null), F.IncludeAnonymous | F.IgnoreMounts);
    e: for (let s, o; ; ) {
      let l = !0, a;
      if (this.stoppedAt != null && n.from >= this.stoppedAt)
        l = !1;
      else if (e.hasNode(n)) {
        if (t) {
          let h = t.mounts.find((c) => c.frag.from <= n.from && c.frag.to >= n.to && c.mount.overlay);
          if (h)
            for (let c of h.mount.overlay) {
              let f = c.from + h.pos, d = c.to + h.pos;
              f >= n.from && d <= n.to && !t.ranges.some((O) => O.from < d && O.to > f) && t.ranges.push({ from: f, to: d });
            }
        }
        l = !1;
      } else if (i && (o = LO(i.ranges, n.from, n.to)))
        l = o != 2;
      else if (!n.type.isAnonymous && (s = this.nest(n, this.input)) && (n.from < n.to || !s.overlay)) {
        n.tree || NO(n);
        let h = e.findMounts(n.from, s.parser);
        if (typeof s.overlay == "function")
          t = new BO(s.parser, s.overlay, h, this.inner.length, n.from, n.tree, t);
        else {
          let c = ta(this.ranges, s.overlay || (n.from < n.to ? [new Be(n.from, n.to)] : []));
          c.length && Kl(c), (c.length || !s.overlay) && this.inner.push(new Hl(s.parser, c.length ? s.parser.startParse(this.input, ia(h, c), c) : s.parser.startParse(""), s.overlay ? s.overlay.map((f) => new Be(f.from - n.from, f.to - n.from)) : null, n.tree, c.length ? c[0].from : n.from)), s.overlay ? c.length && (i = { ranges: c, depth: 0, prev: i }) : l = !1;
        }
      } else t && (a = t.predicate(n)) && (a === !0 && (a = new Be(n.from, n.to)), a.from < a.to && t.ranges.push(a));
      if (l && n.firstChild())
        t && t.depth++, i && i.depth++;
      else
        for (; !n.nextSibling(); ) {
          if (!n.parent())
            break e;
          if (t && !--t.depth) {
            let h = ta(this.ranges, t.ranges);
            h.length && (Kl(h), this.inner.splice(t.index, 0, new Hl(t.parser, t.parser.startParse(this.input, ia(t.mounts, h), h), t.ranges.map((c) => new Be(c.from - t.start, c.to - t.start)), t.target, h[0].from))), t = t.prev;
          }
          i && !--i.depth && (i = i.prev);
        }
    }
  }
}
function LO(r, e, t) {
  for (let i of r) {
    if (i.from >= t)
      break;
    if (i.to > e)
      return i.from <= e && i.to >= t ? 2 : 1;
  }
  return 0;
}
function Jl(r, e, t, i, n, s) {
  if (e < t) {
    let o = r.buffer[e + 1];
    i.push(r.slice(e, t, o)), n.push(o - s);
  }
}
function NO(r) {
  let { node: e } = r, t = [], i = e.context.buffer;
  do
    t.push(r.index), r.parent();
  while (!r.tree);
  let n = r.tree, s = n.children.indexOf(i), o = n.children[s], l = o.buffer, a = [s];
  function h(c, f, d, O, p, m) {
    let g = t[m], b = [], S = [];
    Jl(o, c, g, b, S, O);
    let k = l[g + 1], Q = l[g + 2];
    a.push(b.length);
    let x = m ? h(g + 4, l[g + 3], o.set.types[l[g]], k, Q - k, m - 1) : e.toTree();
    return b.push(x), S.push(k - O), Jl(o, l[g + 3], f, b, S, O), new _(d, b, S, p);
  }
  n.children[s] = h(0, l.length, ae.none, 0, o.length, t.length - 1);
  for (let c of a) {
    let f = r.tree.children[c], d = r.tree.positions[c];
    r.yield(new be(f, d + r.from, c, r._tree));
  }
}
class ea {
  constructor(e, t) {
    this.offset = t, this.done = !1, this.cursor = e.cursor(F.IncludeAnonymous | F.IgnoreMounts);
  }
  // Move to the first node (in pre-order) that starts at or after `pos`.
  moveTo(e) {
    let { cursor: t } = this, i = e - this.offset;
    for (; !this.done && t.from < i; )
      t.to >= e && t.enter(i, 1, F.IgnoreOverlays | F.ExcludeBuffers) || t.next(!1) || (this.done = !0);
  }
  hasNode(e) {
    if (this.moveTo(e.from), !this.done && this.cursor.from + this.offset == e.from && this.cursor.tree)
      for (let t = this.cursor.tree; ; ) {
        if (t == e.tree)
          return !0;
        if (t.children.length && t.positions[0] == 0 && t.children[0] instanceof _)
          t = t.children[0];
        else
          break;
      }
    return !1;
  }
}
let _O = class {
  constructor(e) {
    var t;
    if (this.fragments = e, this.curTo = 0, this.fragI = 0, e.length) {
      let i = this.curFrag = e[0];
      this.curTo = (t = i.tree.prop(js)) !== null && t !== void 0 ? t : i.to, this.inner = new ea(i.tree, -i.offset);
    } else
      this.curFrag = this.inner = null;
  }
  hasNode(e) {
    for (; this.curFrag && e.from >= this.curTo; )
      this.nextFrag();
    return this.curFrag && this.curFrag.from <= e.from && this.curTo >= e.to && this.inner.hasNode(e);
  }
  nextFrag() {
    var e;
    if (this.fragI++, this.fragI == this.fragments.length)
      this.curFrag = this.inner = null;
    else {
      let t = this.curFrag = this.fragments[this.fragI];
      this.curTo = (e = t.tree.prop(js)) !== null && e !== void 0 ? e : t.to, this.inner = new ea(t.tree, -t.offset);
    }
  }
  findMounts(e, t) {
    var i;
    let n = [];
    if (this.inner) {
      this.inner.cursor.moveTo(e, 1);
      for (let s = this.inner.cursor.node; s; s = s.parent) {
        let o = (i = s.tree) === null || i === void 0 ? void 0 : i.prop(X.mounted);
        if (o && o.parser == t)
          for (let l = this.fragI; l < this.fragments.length; l++) {
            let a = this.fragments[l];
            if (a.from >= s.to)
              break;
            a.tree == this.curFrag.tree && n.push({
              frag: a,
              pos: s.from - a.offset,
              mount: o
            });
          }
      }
    }
    return n;
  }
};
function ta(r, e) {
  let t = null, i = e;
  for (let n = 1, s = 0; n < r.length; n++) {
    let o = r[n - 1].to, l = r[n].from;
    for (; s < i.length; s++) {
      let a = i[s];
      if (a.from >= l)
        break;
      a.to <= o || (t || (i = t = e.slice()), a.from < o ? (t[s] = new Be(a.from, o), a.to > l && t.splice(s + 1, 0, new Be(l, a.to))) : a.to > l ? t[s--] = new Be(l, a.to) : t.splice(s--, 1));
    }
  }
  return i;
}
function UO(r, e, t, i) {
  let n = 0, s = 0, o = !1, l = !1, a = -1e9, h = [];
  for (; ; ) {
    let c = n == r.length ? 1e9 : o ? r[n].to : r[n].from, f = s == e.length ? 1e9 : l ? e[s].to : e[s].from;
    if (o != l) {
      let d = Math.max(a, t), O = Math.min(c, f, i);
      d < O && h.push(new Be(d, O));
    }
    if (a = Math.min(c, f), a == 1e9)
      break;
    c == a && (o ? (o = !1, n++) : o = !0), f == a && (l ? (l = !1, s++) : l = !0);
  }
  return h;
}
function ia(r, e) {
  let t = [];
  for (let { pos: i, mount: n, frag: s } of r) {
    let o = i + (n.overlay ? n.overlay[0].from : 0), l = o + n.tree.length, a = Math.max(s.from, o), h = Math.min(s.to, l);
    if (n.overlay) {
      let c = n.overlay.map((d) => new Be(d.from + i, d.to + i)), f = UO(e, c, a, h);
      for (let d = 0, O = a; ; d++) {
        let p = d == f.length, m = p ? h : f[d].from;
        if (m > O && t.push(new pt(O, m, n.tree, -o, s.from >= O || s.openStart, s.to <= m || s.openEnd)), p)
          break;
        O = f[d].to;
      }
    } else
      t.push(new pt(a, h, n.tree, -o, s.from >= o || s.openStart, s.to <= l || s.openEnd));
  }
  return t;
}
class wn {
  /**
  @internal
  */
  constructor(e, t, i, n, s, o, l, a, h, c = 0, f) {
    this.p = e, this.stack = t, this.state = i, this.reducePos = n, this.pos = s, this.score = o, this.buffer = l, this.bufferBase = a, this.curContext = h, this.lookAhead = c, this.parent = f;
  }
  /**
  @internal
  */
  toString() {
    return `[${this.stack.filter((e, t) => t % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
  }
  // Start an empty stack
  /**
  @internal
  */
  static start(e, t, i = 0) {
    let n = e.parser.context;
    return new wn(e, [], t, i, i, 0, [], 0, n ? new ra(n, n.start) : null, 0, null);
  }
  /**
  The stack's current [context](#lr.ContextTracker) value, if
  any. Its type will depend on the context tracker's type
  parameter, or it will be `null` if there is no context
  tracker.
  */
  get context() {
    return this.curContext ? this.curContext.context : null;
  }
  // Push a state onto the stack, tracking its start position as well
  // as the buffer base at that point.
  /**
  @internal
  */
  pushState(e, t) {
    this.stack.push(this.state, t, this.bufferBase + this.buffer.length), this.state = e;
  }
  // Apply a reduce action
  /**
  @internal
  */
  reduce(e) {
    var t;
    let i = e >> 19, n = e & 65535, { parser: s } = this.p, o = this.reducePos < this.pos - 25;
    o && this.setLookAhead(this.pos);
    let l = s.dynamicPrecedence(n);
    if (l && (this.score += l), i == 0) {
      this.pushState(s.getGoto(this.state, n, !0), this.reducePos), n < s.minRepeatTerm && this.storeNode(n, this.reducePos, this.reducePos, o ? 8 : 4, !0), this.reduceContext(n, this.reducePos);
      return;
    }
    let a = this.stack.length - (i - 1) * 3 - (e & 262144 ? 6 : 0), h = a ? this.stack[a - 2] : this.p.ranges[0].from, c = this.reducePos - h;
    c >= 2e3 && !(!((t = this.p.parser.nodeSet.types[n]) === null || t === void 0) && t.isAnonymous) && (h == this.p.lastBigReductionStart ? (this.p.bigReductionCount++, this.p.lastBigReductionSize = c) : this.p.lastBigReductionSize < c && (this.p.bigReductionCount = 1, this.p.lastBigReductionStart = h, this.p.lastBigReductionSize = c));
    let f = a ? this.stack[a - 1] : 0, d = this.bufferBase + this.buffer.length - f;
    if (n < s.minRepeatTerm || e & 131072) {
      let O = s.stateFlag(
        this.state,
        1
        /* StateFlag.Skipped */
      ) ? this.pos : this.reducePos;
      this.storeNode(n, h, O, d + 4, !0);
    }
    if (e & 262144)
      this.state = this.stack[a];
    else {
      let O = this.stack[a - 3];
      this.state = s.getGoto(O, n, !0);
    }
    for (; this.stack.length > a; )
      this.stack.pop();
    this.reduceContext(n, h);
  }
  // Shift a value into the buffer
  /**
  @internal
  */
  storeNode(e, t, i, n = 4, s = !1) {
    if (e == 0 && (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
      let o = this, l = this.buffer.length;
      if (l == 0 && o.parent && (l = o.bufferBase - o.parent.bufferBase, o = o.parent), l > 0 && o.buffer[l - 4] == 0 && o.buffer[l - 1] > -1) {
        if (t == i)
          return;
        if (o.buffer[l - 2] >= t) {
          o.buffer[l - 2] = i;
          return;
        }
      }
    }
    if (!s || this.pos == i)
      this.buffer.push(e, t, i, n);
    else {
      let o = this.buffer.length;
      if (o > 0 && this.buffer[o - 4] != 0) {
        let l = !1;
        for (let a = o; a > 0 && this.buffer[a - 2] > i; a -= 4)
          if (this.buffer[a - 1] >= 0) {
            l = !0;
            break;
          }
        if (l)
          for (; o > 0 && this.buffer[o - 2] > i; )
            this.buffer[o] = this.buffer[o - 4], this.buffer[o + 1] = this.buffer[o - 3], this.buffer[o + 2] = this.buffer[o - 2], this.buffer[o + 3] = this.buffer[o - 1], o -= 4, n > 4 && (n -= 4);
      }
      this.buffer[o] = e, this.buffer[o + 1] = t, this.buffer[o + 2] = i, this.buffer[o + 3] = n;
    }
  }
  // Apply a shift action
  /**
  @internal
  */
  shift(e, t, i, n) {
    if (e & 131072)
      this.pushState(e & 65535, this.pos);
    else if (e & 262144)
      this.pos = n, this.shiftContext(t, i), t <= this.p.parser.maxNode && this.buffer.push(t, i, n, 4);
    else {
      let s = e, { parser: o } = this.p;
      (n > this.pos || t <= o.maxNode) && (this.pos = n, o.stateFlag(
        s,
        1
        /* StateFlag.Skipped */
      ) || (this.reducePos = n)), this.pushState(s, i), this.shiftContext(t, i), t <= o.maxNode && this.buffer.push(t, i, n, 4);
    }
  }
  // Apply an action
  /**
  @internal
  */
  apply(e, t, i, n) {
    e & 65536 ? this.reduce(e) : this.shift(e, t, i, n);
  }
  // Add a prebuilt (reused) node into the buffer.
  /**
  @internal
  */
  useNode(e, t) {
    let i = this.p.reused.length - 1;
    (i < 0 || this.p.reused[i] != e) && (this.p.reused.push(e), i++);
    let n = this.pos;
    this.reducePos = this.pos = n + e.length, this.pushState(t, n), this.buffer.push(
      i,
      n,
      this.reducePos,
      -1
      /* size == -1 means this is a reused value */
    ), this.curContext && this.updateContext(this.curContext.tracker.reuse(this.curContext.context, e, this, this.p.stream.reset(this.pos - e.length)));
  }
  // Split the stack. Due to the buffer sharing and the fact
  // that `this.stack` tends to stay quite shallow, this isn't very
  // expensive.
  /**
  @internal
  */
  split() {
    let e = this, t = e.buffer.length;
    for (; t > 0 && e.buffer[t - 2] > e.reducePos; )
      t -= 4;
    let i = e.buffer.slice(t), n = e.bufferBase + t;
    for (; e && n == e.bufferBase; )
      e = e.parent;
    return new wn(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, i, n, this.curContext, this.lookAhead, e);
  }
  // Try to recover from an error by 'deleting' (ignoring) one token.
  /**
  @internal
  */
  recoverByDelete(e, t) {
    let i = e <= this.p.parser.maxNode;
    i && this.storeNode(e, this.pos, t, 4), this.storeNode(0, this.pos, t, i ? 8 : 4), this.pos = this.reducePos = t, this.score -= 190;
  }
  /**
  Check if the given term would be able to be shifted (optionally
  after some reductions) on this stack. This can be useful for
  external tokenizers that want to make sure they only provide a
  given token when it applies.
  */
  canShift(e) {
    for (let t = new IO(this); ; ) {
      let i = this.p.parser.stateSlot(
        t.state,
        4
        /* ParseState.DefaultReduce */
      ) || this.p.parser.hasAction(t.state, e);
      if (i == 0)
        return !1;
      if (!(i & 65536))
        return !0;
      t.reduce(i);
    }
  }
  // Apply up to Recover.MaxNext recovery actions that conceptually
  // inserts some missing token or rule.
  /**
  @internal
  */
  recoverByInsert(e) {
    if (this.stack.length >= 300)
      return [];
    let t = this.p.parser.nextStates(this.state);
    if (t.length > 8 || this.stack.length >= 120) {
      let n = [];
      for (let s = 0, o; s < t.length; s += 2)
        (o = t[s + 1]) != this.state && this.p.parser.hasAction(o, e) && n.push(t[s], o);
      if (this.stack.length < 120)
        for (let s = 0; n.length < 8 && s < t.length; s += 2) {
          let o = t[s + 1];
          n.some((l, a) => a & 1 && l == o) || n.push(t[s], o);
        }
      t = n;
    }
    let i = [];
    for (let n = 0; n < t.length && i.length < 4; n += 2) {
      let s = t[n + 1];
      if (s == this.state)
        continue;
      let o = this.split();
      o.pushState(s, this.pos), o.storeNode(0, o.pos, o.pos, 4, !0), o.shiftContext(t[n], this.pos), o.reducePos = this.pos, o.score -= 200, i.push(o);
    }
    return i;
  }
  // Force a reduce, if possible. Return false if that can't
  // be done.
  /**
  @internal
  */
  forceReduce() {
    let { parser: e } = this.p, t = e.stateSlot(
      this.state,
      5
      /* ParseState.ForcedReduce */
    );
    if (!(t & 65536))
      return !1;
    if (!e.validAction(this.state, t)) {
      let i = t >> 19, n = t & 65535, s = this.stack.length - i * 3;
      if (s < 0 || e.getGoto(this.stack[s], n, !1) < 0) {
        let o = this.findForcedReduction();
        if (o == null)
          return !1;
        t = o;
      }
      this.storeNode(0, this.pos, this.pos, 4, !0), this.score -= 100;
    }
    return this.reducePos = this.pos, this.reduce(t), !0;
  }
  /**
  Try to scan through the automaton to find some kind of reduction
  that can be applied. Used when the regular ForcedReduce field
  isn't a valid action. @internal
  */
  findForcedReduction() {
    let { parser: e } = this.p, t = [], i = (n, s) => {
      if (!t.includes(n))
        return t.push(n), e.allActions(n, (o) => {
          if (!(o & 393216)) if (o & 65536) {
            let l = (o >> 19) - s;
            if (l > 1) {
              let a = o & 65535, h = this.stack.length - l * 3;
              if (h >= 0 && e.getGoto(this.stack[h], a, !1) >= 0)
                return l << 19 | 65536 | a;
            }
          } else {
            let l = i(o, s + 1);
            if (l != null)
              return l;
          }
        });
    };
    return i(this.state, 0);
  }
  /**
  @internal
  */
  forceAll() {
    for (; !this.p.parser.stateFlag(
      this.state,
      2
      /* StateFlag.Accepting */
    ); )
      if (!this.forceReduce()) {
        this.storeNode(0, this.pos, this.pos, 4, !0);
        break;
      }
    return this;
  }
  /**
  Check whether this state has no further actions (assumed to be a direct descendant of the
  top state, since any other states must be able to continue
  somehow). @internal
  */
  get deadEnd() {
    if (this.stack.length != 3)
      return !1;
    let { parser: e } = this.p;
    return e.data[e.stateSlot(
      this.state,
      1
      /* ParseState.Actions */
    )] == 65535 && !e.stateSlot(
      this.state,
      4
      /* ParseState.DefaultReduce */
    );
  }
  /**
  Restart the stack (put it back in its start state). Only safe
  when this.stack.length == 3 (state is directly below the top
  state). @internal
  */
  restart() {
    this.storeNode(0, this.pos, this.pos, 4, !0), this.state = this.stack[0], this.stack.length = 0;
  }
  /**
  @internal
  */
  sameState(e) {
    if (this.state != e.state || this.stack.length != e.stack.length)
      return !1;
    for (let t = 0; t < this.stack.length; t += 3)
      if (this.stack[t] != e.stack[t])
        return !1;
    return !0;
  }
  /**
  Get the parser used by this stack.
  */
  get parser() {
    return this.p.parser;
  }
  /**
  Test whether a given dialect (by numeric ID, as exported from
  the terms file) is enabled.
  */
  dialectEnabled(e) {
    return this.p.parser.dialect.flags[e];
  }
  shiftContext(e, t) {
    this.curContext && this.updateContext(this.curContext.tracker.shift(this.curContext.context, e, this, this.p.stream.reset(t)));
  }
  reduceContext(e, t) {
    this.curContext && this.updateContext(this.curContext.tracker.reduce(this.curContext.context, e, this, this.p.stream.reset(t)));
  }
  /**
  @internal
  */
  emitContext() {
    let e = this.buffer.length - 1;
    (e < 0 || this.buffer[e] != -3) && this.buffer.push(this.curContext.hash, this.pos, this.pos, -3);
  }
  /**
  @internal
  */
  emitLookAhead() {
    let e = this.buffer.length - 1;
    (e < 0 || this.buffer[e] != -4) && this.buffer.push(this.lookAhead, this.pos, this.pos, -4);
  }
  updateContext(e) {
    if (e != this.curContext.context) {
      let t = new ra(this.curContext.tracker, e);
      t.hash != this.curContext.hash && this.emitContext(), this.curContext = t;
    }
  }
  /**
  @internal
  */
  setLookAhead(e) {
    e > this.lookAhead && (this.emitLookAhead(), this.lookAhead = e);
  }
  /**
  @internal
  */
  close() {
    this.curContext && this.curContext.tracker.strict && this.emitContext(), this.lookAhead > 0 && this.emitLookAhead();
  }
}
class ra {
  constructor(e, t) {
    this.tracker = e, this.context = t, this.hash = e.strict ? e.hash(t) : 0;
  }
}
class IO {
  constructor(e) {
    this.start = e, this.state = e.state, this.stack = e.stack, this.base = this.stack.length;
  }
  reduce(e) {
    let t = e & 65535, i = e >> 19;
    i == 0 ? (this.stack == this.start.stack && (this.stack = this.stack.slice()), this.stack.push(this.state, 0, 0), this.base += 3) : this.base -= (i - 1) * 3;
    let n = this.start.p.parser.getGoto(this.stack[this.base - 3], t, !0);
    this.state = n;
  }
}
class Pn {
  constructor(e, t, i) {
    this.stack = e, this.pos = t, this.index = i, this.buffer = e.buffer, this.index == 0 && this.maybeNext();
  }
  static create(e, t = e.bufferBase + e.buffer.length) {
    return new Pn(e, t, t - e.bufferBase);
  }
  maybeNext() {
    let e = this.stack.parent;
    e != null && (this.index = this.stack.bufferBase - e.bufferBase, this.stack = e, this.buffer = e.buffer);
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  next() {
    this.index -= 4, this.pos -= 4, this.index == 0 && this.maybeNext();
  }
  fork() {
    return new Pn(this.stack, this.pos, this.index);
  }
}
function Li(r, e = Uint16Array) {
  if (typeof r != "string")
    return r;
  let t = null;
  for (let i = 0, n = 0; i < r.length; ) {
    let s = 0;
    for (; ; ) {
      let o = r.charCodeAt(i++), l = !1;
      if (o == 126) {
        s = 65535;
        break;
      }
      o >= 92 && o--, o >= 34 && o--;
      let a = o - 32;
      if (a >= 46 && (a -= 46, l = !0), s += a, l)
        break;
      s *= 46;
    }
    t ? t[n++] = s : t = new e(s);
  }
  return t;
}
class un {
  constructor() {
    this.start = -1, this.value = -1, this.end = -1, this.extended = -1, this.lookAhead = 0, this.mask = 0, this.context = 0;
  }
}
const na = new un();
class jO {
  /**
  @internal
  */
  constructor(e, t) {
    this.input = e, this.ranges = t, this.chunk = "", this.chunkOff = 0, this.chunk2 = "", this.chunk2Pos = 0, this.next = -1, this.token = na, this.rangeIndex = 0, this.pos = this.chunkPos = t[0].from, this.range = t[0], this.end = t[t.length - 1].to, this.readNext();
  }
  /**
  @internal
  */
  resolveOffset(e, t) {
    let i = this.range, n = this.rangeIndex, s = this.pos + e;
    for (; s < i.from; ) {
      if (!n)
        return null;
      let o = this.ranges[--n];
      s -= i.from - o.to, i = o;
    }
    for (; t < 0 ? s > i.to : s >= i.to; ) {
      if (n == this.ranges.length - 1)
        return null;
      let o = this.ranges[++n];
      s += o.from - i.to, i = o;
    }
    return s;
  }
  /**
  @internal
  */
  clipPos(e) {
    if (e >= this.range.from && e < this.range.to)
      return e;
    for (let t of this.ranges)
      if (t.to > e)
        return Math.max(e, t.from);
    return this.end;
  }
  /**
  Look at a code unit near the stream position. `.peek(0)` equals
  `.next`, `.peek(-1)` gives you the previous character, and so
  on.
  
  Note that looking around during tokenizing creates dependencies
  on potentially far-away content, which may reduce the
  effectiveness incremental parsing—when looking forward—or even
  cause invalid reparses when looking backward more than 25 code
  units, since the library does not track lookbehind.
  */
  peek(e) {
    let t = this.chunkOff + e, i, n;
    if (t >= 0 && t < this.chunk.length)
      i = this.pos + e, n = this.chunk.charCodeAt(t);
    else {
      let s = this.resolveOffset(e, 1);
      if (s == null)
        return -1;
      if (i = s, i >= this.chunk2Pos && i < this.chunk2Pos + this.chunk2.length)
        n = this.chunk2.charCodeAt(i - this.chunk2Pos);
      else {
        let o = this.rangeIndex, l = this.range;
        for (; l.to <= i; )
          l = this.ranges[++o];
        this.chunk2 = this.input.chunk(this.chunk2Pos = i), i + this.chunk2.length > l.to && (this.chunk2 = this.chunk2.slice(0, l.to - i)), n = this.chunk2.charCodeAt(0);
      }
    }
    return i >= this.token.lookAhead && (this.token.lookAhead = i + 1), n;
  }
  /**
  Accept a token. By default, the end of the token is set to the
  current stream position, but you can pass an offset (relative to
  the stream position) to change that.
  */
  acceptToken(e, t = 0) {
    let i = t ? this.resolveOffset(t, -1) : this.pos;
    if (i == null || i < this.token.start)
      throw new RangeError("Token end out of bounds");
    this.token.value = e, this.token.end = i;
  }
  /**
  Accept a token ending at a specific given position.
  */
  acceptTokenTo(e, t) {
    this.token.value = e, this.token.end = t;
  }
  getChunk() {
    if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
      let { chunk: e, chunkPos: t } = this;
      this.chunk = this.chunk2, this.chunkPos = this.chunk2Pos, this.chunk2 = e, this.chunk2Pos = t, this.chunkOff = this.pos - this.chunkPos;
    } else {
      this.chunk2 = this.chunk, this.chunk2Pos = this.chunkPos;
      let e = this.input.chunk(this.pos), t = this.pos + e.length;
      this.chunk = t > this.range.to ? e.slice(0, this.range.to - this.pos) : e, this.chunkPos = this.pos, this.chunkOff = 0;
    }
  }
  readNext() {
    return this.chunkOff >= this.chunk.length && (this.getChunk(), this.chunkOff == this.chunk.length) ? this.next = -1 : this.next = this.chunk.charCodeAt(this.chunkOff);
  }
  /**
  Move the stream forward N (defaults to 1) code units. Returns
  the new value of [`next`](#lr.InputStream.next).
  */
  advance(e = 1) {
    for (this.chunkOff += e; this.pos + e >= this.range.to; ) {
      if (this.rangeIndex == this.ranges.length - 1)
        return this.setDone();
      e -= this.range.to - this.pos, this.range = this.ranges[++this.rangeIndex], this.pos = this.range.from;
    }
    return this.pos += e, this.pos >= this.token.lookAhead && (this.token.lookAhead = this.pos + 1), this.readNext();
  }
  setDone() {
    return this.pos = this.chunkPos = this.end, this.range = this.ranges[this.rangeIndex = this.ranges.length - 1], this.chunk = "", this.next = -1;
  }
  /**
  @internal
  */
  reset(e, t) {
    if (t ? (this.token = t, t.start = e, t.lookAhead = e + 1, t.value = t.extended = -1) : this.token = na, this.pos != e) {
      if (this.pos = e, e == this.end)
        return this.setDone(), this;
      for (; e < this.range.from; )
        this.range = this.ranges[--this.rangeIndex];
      for (; e >= this.range.to; )
        this.range = this.ranges[++this.rangeIndex];
      e >= this.chunkPos && e < this.chunkPos + this.chunk.length ? this.chunkOff = e - this.chunkPos : (this.chunk = "", this.chunkOff = 0), this.readNext();
    }
    return this;
  }
  /**
  @internal
  */
  read(e, t) {
    if (e >= this.chunkPos && t <= this.chunkPos + this.chunk.length)
      return this.chunk.slice(e - this.chunkPos, t - this.chunkPos);
    if (e >= this.chunk2Pos && t <= this.chunk2Pos + this.chunk2.length)
      return this.chunk2.slice(e - this.chunk2Pos, t - this.chunk2Pos);
    if (e >= this.range.from && t <= this.range.to)
      return this.input.read(e, t);
    let i = "";
    for (let n of this.ranges) {
      if (n.from >= t)
        break;
      n.to > e && (i += this.input.read(Math.max(n.from, e), Math.min(n.to, t)));
    }
    return i;
  }
}
class fi {
  constructor(e, t) {
    this.data = e, this.id = t;
  }
  token(e, t) {
    let { parser: i } = t.p;
    Tc(this.data, e, t, this.id, i.data, i.tokenPrecTable);
  }
}
fi.prototype.contextual = fi.prototype.fallback = fi.prototype.extend = !1;
class $n {
  constructor(e, t, i) {
    this.precTable = t, this.elseToken = i, this.data = typeof e == "string" ? Li(e) : e;
  }
  token(e, t) {
    let i = e.pos, n = 0;
    for (; ; ) {
      let s = e.next < 0, o = e.resolveOffset(1, 1);
      if (Tc(this.data, e, t, 0, this.data, this.precTable), e.token.value > -1)
        break;
      if (this.elseToken == null)
        return;
      if (s || n++, o == null)
        break;
      e.reset(o, e.token);
    }
    n && (e.reset(i, e.token), e.acceptToken(this.elseToken, n));
  }
}
$n.prototype.contextual = fi.prototype.fallback = fi.prototype.extend = !1;
class Ke {
  /**
  Create a tokenizer. The first argument is the function that,
  given an input stream, scans for the types of tokens it
  recognizes at the stream's position, and calls
  [`acceptToken`](#lr.InputStream.acceptToken) when it finds
  one.
  */
  constructor(e, t = {}) {
    this.token = e, this.contextual = !!t.contextual, this.fallback = !!t.fallback, this.extend = !!t.extend;
  }
}
function Tc(r, e, t, i, n, s) {
  let o = 0, l = 1 << i, { dialect: a } = t.p.parser;
  e: for (; l & r[o]; ) {
    let h = r[o + 1];
    for (let O = o + 3; O < h; O += 2)
      if ((r[O + 1] & l) > 0) {
        let p = r[O];
        if (a.allows(p) && (e.token.value == -1 || e.token.value == p || GO(p, e.token.value, n, s))) {
          e.acceptToken(p);
          break;
        }
      }
    let c = e.next, f = 0, d = r[o + 2];
    if (e.next < 0 && d > f && r[h + d * 3 - 3] == 65535) {
      o = r[h + d * 3 - 1];
      continue e;
    }
    for (; f < d; ) {
      let O = f + d >> 1, p = h + O + (O << 1), m = r[p], g = r[p + 1] || 65536;
      if (c < m)
        d = O;
      else if (c >= g)
        f = O + 1;
      else {
        o = r[p + 2], e.advance();
        continue e;
      }
    }
    break;
  }
}
function sa(r, e, t) {
  for (let i = e, n; (n = r[i]) != 65535; i++)
    if (n == t)
      return i - e;
  return -1;
}
function GO(r, e, t, i) {
  let n = sa(t, i, e);
  return n < 0 || sa(t, i, r) < n;
}
const Ae = typeof process < "u" && process.env && /\bparse\b/.test(process.env.LOG);
let cs = null;
function oa(r, e, t) {
  let i = r.cursor(F.IncludeAnonymous);
  for (i.moveTo(e); ; )
    if (!(t < 0 ? i.childBefore(e) : i.childAfter(e)))
      for (; ; ) {
        if ((t < 0 ? i.to < e : i.from > e) && !i.type.isError)
          return t < 0 ? Math.max(0, Math.min(
            i.to - 1,
            e - 25
            /* Lookahead.Margin */
          )) : Math.min(r.length, Math.max(
            i.from + 1,
            e + 25
            /* Lookahead.Margin */
          ));
        if (t < 0 ? i.prevSibling() : i.nextSibling())
          break;
        if (!i.parent())
          return t < 0 ? 0 : r.length;
      }
}
let FO = class {
  constructor(e, t) {
    this.fragments = e, this.nodeSet = t, this.i = 0, this.fragment = null, this.safeFrom = -1, this.safeTo = -1, this.trees = [], this.start = [], this.index = [], this.nextFragment();
  }
  nextFragment() {
    let e = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
    if (e) {
      for (this.safeFrom = e.openStart ? oa(e.tree, e.from + e.offset, 1) - e.offset : e.from, this.safeTo = e.openEnd ? oa(e.tree, e.to + e.offset, -1) - e.offset : e.to; this.trees.length; )
        this.trees.pop(), this.start.pop(), this.index.pop();
      this.trees.push(e.tree), this.start.push(-e.offset), this.index.push(0), this.nextStart = this.safeFrom;
    } else
      this.nextStart = 1e9;
  }
  // `pos` must be >= any previously given `pos` for this cursor
  nodeAt(e) {
    if (e < this.nextStart)
      return null;
    for (; this.fragment && this.safeTo <= e; )
      this.nextFragment();
    if (!this.fragment)
      return null;
    for (; ; ) {
      let t = this.trees.length - 1;
      if (t < 0)
        return this.nextFragment(), null;
      let i = this.trees[t], n = this.index[t];
      if (n == i.children.length) {
        this.trees.pop(), this.start.pop(), this.index.pop();
        continue;
      }
      let s = i.children[n], o = this.start[t] + i.positions[n];
      if (o > e)
        return this.nextStart = o, null;
      if (s instanceof _) {
        if (o == e) {
          if (o < this.safeFrom)
            return null;
          let l = o + s.length;
          if (l <= this.safeTo) {
            let a = s.prop(X.lookAhead);
            if (!a || l + a < this.fragment.to)
              return s;
          }
        }
        this.index[t]++, o + s.length >= Math.max(this.safeFrom, e) && (this.trees.push(s), this.start.push(o), this.index.push(0));
      } else
        this.index[t]++, this.nextStart = o + s.length;
    }
  }
};
class HO {
  constructor(e, t) {
    this.stream = t, this.tokens = [], this.mainToken = null, this.actions = [], this.tokens = e.tokenizers.map((i) => new un());
  }
  getActions(e) {
    let t = 0, i = null, { parser: n } = e.p, { tokenizers: s } = n, o = n.stateSlot(
      e.state,
      3
      /* ParseState.TokenizerMask */
    ), l = e.curContext ? e.curContext.hash : 0, a = 0;
    for (let h = 0; h < s.length; h++) {
      if (!(1 << h & o))
        continue;
      let c = s[h], f = this.tokens[h];
      if (!(i && !c.fallback) && ((c.contextual || f.start != e.pos || f.mask != o || f.context != l) && (this.updateCachedToken(f, c, e), f.mask = o, f.context = l), f.lookAhead > f.end + 25 && (a = Math.max(f.lookAhead, a)), f.value != 0)) {
        let d = t;
        if (f.extended > -1 && (t = this.addActions(e, f.extended, f.end, t)), t = this.addActions(e, f.value, f.end, t), !c.extend && (i = f, t > d))
          break;
      }
    }
    for (; this.actions.length > t; )
      this.actions.pop();
    return a && e.setLookAhead(a), !i && e.pos == this.stream.end && (i = new un(), i.value = e.p.parser.eofTerm, i.start = i.end = e.pos, t = this.addActions(e, i.value, i.end, t)), this.mainToken = i, this.actions;
  }
  getMainToken(e) {
    if (this.mainToken)
      return this.mainToken;
    let t = new un(), { pos: i, p: n } = e;
    return t.start = i, t.end = Math.min(i + 1, n.stream.end), t.value = i == n.stream.end ? n.parser.eofTerm : 0, t;
  }
  updateCachedToken(e, t, i) {
    let n = this.stream.clipPos(i.pos);
    if (t.token(this.stream.reset(n, e), i), e.value > -1) {
      let { parser: s } = i.p;
      for (let o = 0; o < s.specialized.length; o++)
        if (s.specialized[o] == e.value) {
          let l = s.specializers[o](this.stream.read(e.start, e.end), i);
          if (l >= 0 && i.p.parser.dialect.allows(l >> 1)) {
            l & 1 ? e.extended = l >> 1 : e.value = l >> 1;
            break;
          }
        }
    } else
      e.value = 0, e.end = this.stream.clipPos(n + 1);
  }
  putAction(e, t, i, n) {
    for (let s = 0; s < n; s += 3)
      if (this.actions[s] == e)
        return n;
    return this.actions[n++] = e, this.actions[n++] = t, this.actions[n++] = i, n;
  }
  addActions(e, t, i, n) {
    let { state: s } = e, { parser: o } = e.p, { data: l } = o;
    for (let a = 0; a < 2; a++)
      for (let h = o.stateSlot(
        s,
        a ? 2 : 1
        /* ParseState.Actions */
      ); ; h += 3) {
        if (l[h] == 65535)
          if (l[h + 1] == 1)
            h = Ot(l, h + 2);
          else {
            n == 0 && l[h + 1] == 2 && (n = this.putAction(Ot(l, h + 2), t, i, n));
            break;
          }
        l[h] == t && (n = this.putAction(Ot(l, h + 1), t, i, n));
      }
    return n;
  }
}
class KO {
  constructor(e, t, i, n) {
    this.parser = e, this.input = t, this.ranges = n, this.recovering = 0, this.nextStackID = 9812, this.minStackPos = 0, this.reused = [], this.stoppedAt = null, this.lastBigReductionStart = -1, this.lastBigReductionSize = 0, this.bigReductionCount = 0, this.stream = new jO(t, n), this.tokens = new HO(e, this.stream), this.topTerm = e.top[1];
    let { from: s } = n[0];
    this.stacks = [wn.start(this, e.top[0], s)], this.fragments = i.length && this.stream.end - s > e.bufferLength * 4 ? new FO(i, e.nodeSet) : null;
  }
  get parsedPos() {
    return this.minStackPos;
  }
  // Move the parser forward. This will process all parse stacks at
  // `this.pos` and try to advance them to a further position. If no
  // stack for such a position is found, it'll start error-recovery.
  //
  // When the parse is finished, this will return a syntax tree. When
  // not, it returns `null`.
  advance() {
    let e = this.stacks, t = this.minStackPos, i = this.stacks = [], n, s;
    if (this.bigReductionCount > 300 && e.length == 1) {
      let [o] = e;
      for (; o.forceReduce() && o.stack.length && o.stack[o.stack.length - 2] >= this.lastBigReductionStart; )
        ;
      this.bigReductionCount = this.lastBigReductionSize = 0;
    }
    for (let o = 0; o < e.length; o++) {
      let l = e[o];
      for (; ; ) {
        if (this.tokens.mainToken = null, l.pos > t)
          i.push(l);
        else {
          if (this.advanceStack(l, i, e))
            continue;
          {
            n || (n = [], s = []), n.push(l);
            let a = this.tokens.getMainToken(l);
            s.push(a.value, a.end);
          }
        }
        break;
      }
    }
    if (!i.length) {
      let o = n && ep(n);
      if (o)
        return Ae && console.log("Finish with " + this.stackID(o)), this.stackToTree(o);
      if (this.parser.strict)
        throw Ae && n && console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none")), new SyntaxError("No parse at " + t);
      this.recovering || (this.recovering = 5);
    }
    if (this.recovering && n) {
      let o = this.stoppedAt != null && n[0].pos > this.stoppedAt ? n[0] : this.runRecovery(n, s, i);
      if (o)
        return Ae && console.log("Force-finish " + this.stackID(o)), this.stackToTree(o.forceAll());
    }
    if (this.recovering) {
      let o = this.recovering == 1 ? 1 : this.recovering * 3;
      if (i.length > o)
        for (i.sort((l, a) => a.score - l.score); i.length > o; )
          i.pop();
      i.some((l) => l.reducePos > t) && this.recovering--;
    } else if (i.length > 1) {
      e: for (let o = 0; o < i.length - 1; o++) {
        let l = i[o];
        for (let a = o + 1; a < i.length; a++) {
          let h = i[a];
          if (l.sameState(h) || l.buffer.length > 500 && h.buffer.length > 500)
            if ((l.score - h.score || l.buffer.length - h.buffer.length) > 0)
              i.splice(a--, 1);
            else {
              i.splice(o--, 1);
              continue e;
            }
        }
      }
      i.length > 12 && i.splice(
        12,
        i.length - 12
        /* Rec.MaxStackCount */
      );
    }
    this.minStackPos = i[0].pos;
    for (let o = 1; o < i.length; o++)
      i[o].pos < this.minStackPos && (this.minStackPos = i[o].pos);
    return null;
  }
  stopAt(e) {
    if (this.stoppedAt != null && this.stoppedAt < e)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = e;
  }
  // Returns an updated version of the given stack, or null if the
  // stack can't advance normally. When `split` and `stacks` are
  // given, stacks split off by ambiguous operations will be pushed to
  // `split`, or added to `stacks` if they move `pos` forward.
  advanceStack(e, t, i) {
    let n = e.pos, { parser: s } = this, o = Ae ? this.stackID(e) + " -> " : "";
    if (this.stoppedAt != null && n > this.stoppedAt)
      return e.forceReduce() ? e : null;
    if (this.fragments) {
      let h = e.curContext && e.curContext.tracker.strict, c = h ? e.curContext.hash : 0;
      for (let f = this.fragments.nodeAt(n); f; ) {
        let d = this.parser.nodeSet.types[f.type.id] == f.type ? s.getGoto(e.state, f.type.id) : -1;
        if (d > -1 && f.length && (!h || (f.prop(X.contextHash) || 0) == c))
          return e.useNode(f, d), Ae && console.log(o + this.stackID(e) + ` (via reuse of ${s.getName(f.type.id)})`), !0;
        if (!(f instanceof _) || f.children.length == 0 || f.positions[0] > 0)
          break;
        let O = f.children[0];
        if (O instanceof _ && f.positions[0] == 0)
          f = O;
        else
          break;
      }
    }
    let l = s.stateSlot(
      e.state,
      4
      /* ParseState.DefaultReduce */
    );
    if (l > 0)
      return e.reduce(l), Ae && console.log(o + this.stackID(e) + ` (via always-reduce ${s.getName(
        l & 65535
        /* Action.ValueMask */
      )})`), !0;
    if (e.stack.length >= 8400)
      for (; e.stack.length > 6e3 && e.forceReduce(); )
        ;
    let a = this.tokens.getActions(e);
    for (let h = 0; h < a.length; ) {
      let c = a[h++], f = a[h++], d = a[h++], O = h == a.length || !i, p = O ? e : e.split(), m = this.tokens.mainToken;
      if (p.apply(c, f, m ? m.start : p.pos, d), Ae && console.log(o + this.stackID(p) + ` (via ${c & 65536 ? `reduce of ${s.getName(
        c & 65535
        /* Action.ValueMask */
      )}` : "shift"} for ${s.getName(f)} @ ${n}${p == e ? "" : ", split"})`), O)
        return !0;
      p.pos > n ? t.push(p) : i.push(p);
    }
    return !1;
  }
  // Advance a given stack forward as far as it will go. Returns the
  // (possibly updated) stack if it got stuck, or null if it moved
  // forward and was given to `pushStackDedup`.
  advanceFully(e, t) {
    let i = e.pos;
    for (; ; ) {
      if (!this.advanceStack(e, null, null))
        return !1;
      if (e.pos > i)
        return la(e, t), !0;
    }
  }
  runRecovery(e, t, i) {
    let n = null, s = !1;
    for (let o = 0; o < e.length; o++) {
      let l = e[o], a = t[o << 1], h = t[(o << 1) + 1], c = Ae ? this.stackID(l) + " -> " : "";
      if (l.deadEnd && (s || (s = !0, l.restart(), Ae && console.log(c + this.stackID(l) + " (restarted)"), this.advanceFully(l, i))))
        continue;
      let f = l.split(), d = c;
      for (let O = 0; f.forceReduce() && O < 10 && (Ae && console.log(d + this.stackID(f) + " (via force-reduce)"), !this.advanceFully(f, i)); O++)
        Ae && (d = this.stackID(f) + " -> ");
      for (let O of l.recoverByInsert(a))
        Ae && console.log(c + this.stackID(O) + " (via recover-insert)"), this.advanceFully(O, i);
      this.stream.end > l.pos ? (h == l.pos && (h++, a = 0), l.recoverByDelete(a, h), Ae && console.log(c + this.stackID(l) + ` (via recover-delete ${this.parser.getName(a)})`), la(l, i)) : (!n || n.score < l.score) && (n = l);
    }
    return n;
  }
  // Convert the stack's buffer to a syntax tree.
  stackToTree(e) {
    return e.close(), _.build({
      buffer: Pn.create(e),
      nodeSet: this.parser.nodeSet,
      topID: this.topTerm,
      maxBufferLength: this.parser.bufferLength,
      reused: this.reused,
      start: this.ranges[0].from,
      length: e.pos - this.ranges[0].from,
      minRepeatType: this.parser.minRepeatTerm
    });
  }
  stackID(e) {
    let t = (cs || (cs = /* @__PURE__ */ new WeakMap())).get(e);
    return t || cs.set(e, t = String.fromCodePoint(this.nextStackID++)), t + e;
  }
}
function la(r, e) {
  for (let t = 0; t < e.length; t++) {
    let i = e[t];
    if (i.pos == r.pos && i.sameState(r)) {
      e[t].score < r.score && (e[t] = r);
      return;
    }
  }
  e.push(r);
}
class JO {
  constructor(e, t, i) {
    this.source = e, this.flags = t, this.disabled = i;
  }
  allows(e) {
    return !this.disabled || this.disabled[e] == 0;
  }
}
const fs = (r) => r;
class Ac {
  /**
  Define a context tracker.
  */
  constructor(e) {
    this.start = e.start, this.shift = e.shift || fs, this.reduce = e.reduce || fs, this.reuse = e.reuse || fs, this.hash = e.hash || (() => 0), this.strict = e.strict !== !1;
  }
}
class Gt extends il {
  /**
  @internal
  */
  constructor(e) {
    if (super(), this.wrappers = [], e.version != 14)
      throw new RangeError(`Parser version (${e.version}) doesn't match runtime version (14)`);
    let t = e.nodeNames.split(" ");
    this.minRepeatTerm = t.length;
    for (let l = 0; l < e.repeatNodeCount; l++)
      t.push("");
    let i = Object.keys(e.topRules).map((l) => e.topRules[l][1]), n = [];
    for (let l = 0; l < t.length; l++)
      n.push([]);
    function s(l, a, h) {
      n[l].push([a, a.deserialize(String(h))]);
    }
    if (e.nodeProps)
      for (let l of e.nodeProps) {
        let a = l[0];
        typeof a == "string" && (a = X[a]);
        for (let h = 1; h < l.length; ) {
          let c = l[h++];
          if (c >= 0)
            s(c, a, l[h++]);
          else {
            let f = l[h + -c];
            for (let d = -c; d > 0; d--)
              s(l[h++], a, f);
            h++;
          }
        }
      }
    this.nodeSet = new $r(t.map((l, a) => ae.define({
      name: a >= this.minRepeatTerm ? void 0 : l,
      id: a,
      props: n[a],
      top: i.indexOf(a) > -1,
      error: a == 0,
      skipped: e.skippedNodes && e.skippedNodes.indexOf(a) > -1
    }))), e.propSources && (this.nodeSet = this.nodeSet.extend(...e.propSources)), this.strict = !1, this.bufferLength = 1024;
    let o = Li(e.tokenData);
    this.context = e.context, this.specializerSpecs = e.specialized || [], this.specialized = new Uint16Array(this.specializerSpecs.length);
    for (let l = 0; l < this.specializerSpecs.length; l++)
      this.specialized[l] = this.specializerSpecs[l].term;
    this.specializers = this.specializerSpecs.map(aa), this.states = Li(e.states, Uint32Array), this.data = Li(e.stateData), this.goto = Li(e.goto), this.maxTerm = e.maxTerm, this.tokenizers = e.tokenizers.map((l) => typeof l == "number" ? new fi(o, l) : l), this.topRules = e.topRules, this.dialects = e.dialects || {}, this.dynamicPrecedences = e.dynamicPrecedences || null, this.tokenPrecTable = e.tokenPrec, this.termNames = e.termNames || null, this.maxNode = this.nodeSet.types.length - 1, this.dialect = this.parseDialect(), this.top = this.topRules[Object.keys(this.topRules)[0]];
  }
  createParse(e, t, i) {
    let n = new KO(this, e, t, i);
    for (let s of this.wrappers)
      n = s(n, e, t, i);
    return n;
  }
  /**
  Get a goto table entry @internal
  */
  getGoto(e, t, i = !1) {
    let n = this.goto;
    if (t >= n[0])
      return -1;
    for (let s = n[t + 1]; ; ) {
      let o = n[s++], l = o & 1, a = n[s++];
      if (l && i)
        return a;
      for (let h = s + (o >> 1); s < h; s++)
        if (n[s] == e)
          return a;
      if (l)
        return -1;
    }
  }
  /**
  Check if this state has an action for a given terminal @internal
  */
  hasAction(e, t) {
    let i = this.data;
    for (let n = 0; n < 2; n++)
      for (let s = this.stateSlot(
        e,
        n ? 2 : 1
        /* ParseState.Actions */
      ), o; ; s += 3) {
        if ((o = i[s]) == 65535)
          if (i[s + 1] == 1)
            o = i[s = Ot(i, s + 2)];
          else {
            if (i[s + 1] == 2)
              return Ot(i, s + 2);
            break;
          }
        if (o == t || o == 0)
          return Ot(i, s + 1);
      }
    return 0;
  }
  /**
  @internal
  */
  stateSlot(e, t) {
    return this.states[e * 6 + t];
  }
  /**
  @internal
  */
  stateFlag(e, t) {
    return (this.stateSlot(
      e,
      0
      /* ParseState.Flags */
    ) & t) > 0;
  }
  /**
  @internal
  */
  validAction(e, t) {
    return !!this.allActions(e, (i) => i == t ? !0 : null);
  }
  /**
  @internal
  */
  allActions(e, t) {
    let i = this.stateSlot(
      e,
      4
      /* ParseState.DefaultReduce */
    ), n = i ? t(i) : void 0;
    for (let s = this.stateSlot(
      e,
      1
      /* ParseState.Actions */
    ); n == null; s += 3) {
      if (this.data[s] == 65535)
        if (this.data[s + 1] == 1)
          s = Ot(this.data, s + 2);
        else
          break;
      n = t(Ot(this.data, s + 1));
    }
    return n;
  }
  /**
  Get the states that can follow this one through shift actions or
  goto jumps. @internal
  */
  nextStates(e) {
    let t = [];
    for (let i = this.stateSlot(
      e,
      1
      /* ParseState.Actions */
    ); ; i += 3) {
      if (this.data[i] == 65535)
        if (this.data[i + 1] == 1)
          i = Ot(this.data, i + 2);
        else
          break;
      if (!(this.data[i + 2] & 1)) {
        let n = this.data[i + 1];
        t.some((s, o) => o & 1 && s == n) || t.push(this.data[i], n);
      }
    }
    return t;
  }
  /**
  Configure the parser. Returns a new parser instance that has the
  given settings modified. Settings not provided in `config` are
  kept from the original parser.
  */
  configure(e) {
    let t = Object.assign(Object.create(Gt.prototype), this);
    if (e.props && (t.nodeSet = this.nodeSet.extend(...e.props)), e.top) {
      let i = this.topRules[e.top];
      if (!i)
        throw new RangeError(`Invalid top rule name ${e.top}`);
      t.top = i;
    }
    return e.tokenizers && (t.tokenizers = this.tokenizers.map((i) => {
      let n = e.tokenizers.find((s) => s.from == i);
      return n ? n.to : i;
    })), e.specializers && (t.specializers = this.specializers.slice(), t.specializerSpecs = this.specializerSpecs.map((i, n) => {
      let s = e.specializers.find((l) => l.from == i.external);
      if (!s)
        return i;
      let o = Object.assign(Object.assign({}, i), { external: s.to });
      return t.specializers[n] = aa(o), o;
    })), e.contextTracker && (t.context = e.contextTracker), e.dialect && (t.dialect = this.parseDialect(e.dialect)), e.strict != null && (t.strict = e.strict), e.wrap && (t.wrappers = t.wrappers.concat(e.wrap)), e.bufferLength != null && (t.bufferLength = e.bufferLength), t;
  }
  /**
  Tells you whether any [parse wrappers](#lr.ParserConfig.wrap)
  are registered for this parser.
  */
  hasWrappers() {
    return this.wrappers.length > 0;
  }
  /**
  Returns the name associated with a given term. This will only
  work for all terms when the parser was generated with the
  `--names` option. By default, only the names of tagged terms are
  stored.
  */
  getName(e) {
    return this.termNames ? this.termNames[e] : String(e <= this.maxNode && this.nodeSet.types[e].name || e);
  }
  /**
  The eof term id is always allocated directly after the node
  types. @internal
  */
  get eofTerm() {
    return this.maxNode + 1;
  }
  /**
  The type of top node produced by the parser.
  */
  get topNode() {
    return this.nodeSet.types[this.top[1]];
  }
  /**
  @internal
  */
  dynamicPrecedence(e) {
    let t = this.dynamicPrecedences;
    return t == null ? 0 : t[e] || 0;
  }
  /**
  @internal
  */
  parseDialect(e) {
    let t = Object.keys(this.dialects), i = t.map(() => !1);
    if (e)
      for (let s of e.split(" ")) {
        let o = t.indexOf(s);
        o >= 0 && (i[o] = !0);
      }
    let n = null;
    for (let s = 0; s < t.length; s++)
      if (!i[s])
        for (let o = this.dialects[t[s]], l; (l = this.data[o++]) != 65535; )
          (n || (n = new Uint8Array(this.maxTerm + 1)))[l] = 1;
    return new JO(e, i, n);
  }
  /**
  Used by the output of the parser generator. Not available to
  user code. @hide
  */
  static deserialize(e) {
    return new Gt(e);
  }
}
function Ot(r, e) {
  return r[e] | r[e + 1] << 16;
}
function ep(r) {
  let e = null;
  for (let t of r) {
    let i = t.p.stoppedAt;
    (t.pos == t.p.stream.end || i != null && t.pos > i) && t.p.parser.stateFlag(
      t.state,
      2
      /* StateFlag.Accepting */
    ) && (!e || e.score < t.score) && (e = t);
  }
  return e;
}
function aa(r) {
  if (r.external) {
    let e = r.extend ? 1 : 0;
    return (t, i) => r.external(t, i) << 1 | e;
  }
  return r.get;
}
let tp = 0;
class je {
  /**
  @internal
  */
  constructor(e, t, i) {
    this.set = e, this.base = t, this.modified = i, this.id = tp++;
  }
  /**
  Define a new tag. If `parent` is given, the tag is treated as a
  sub-tag of that parent, and
  [highlighters](#highlight.tagHighlighter) that don't mention
  this tag will try to fall back to the parent tag (or grandparent
  tag, etc).
  */
  static define(e) {
    if (e != null && e.base)
      throw new Error("Can not derive from a modified tag");
    let t = new je([], null, []);
    if (t.set.push(t), e)
      for (let i of e.set)
        t.set.push(i);
    return t;
  }
  /**
  Define a tag _modifier_, which is a function that, given a tag,
  will return a tag that is a subtag of the original. Applying the
  same modifier to a twice tag will return the same value (`m1(t1)
  == m1(t1)`) and applying multiple modifiers will, regardless or
  order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
  
  When multiple modifiers are applied to a given base tag, each
  smaller set of modifiers is registered as a parent, so that for
  example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
  `m1(m3(t1)`, and so on.
  */
  static defineModifier() {
    let e = new vn();
    return (t) => t.modified.indexOf(e) > -1 ? t : vn.get(t.base || t, t.modified.concat(e).sort((i, n) => i.id - n.id));
  }
}
let ip = 0;
class vn {
  constructor() {
    this.instances = [], this.id = ip++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let i = t[0].instances.find((l) => l.base == e && rp(t, l.modified));
    if (i)
      return i;
    let n = [], s = new je(n, e, t);
    for (let l of t)
      l.instances.push(s);
    let o = np(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let a of o)
          n.push(vn.get(l, a));
    return s;
  }
}
function rp(r, e) {
  return r.length == e.length && r.every((t, i) => t == e[i]);
}
function np(r) {
  let e = [[]];
  for (let t = 0; t < r.length; t++)
    for (let i = 0, n = e.length; i < n; i++)
      e.push(e[i].concat(r[t]));
  return e.sort((t, i) => i.length - t.length);
}
function ii(r) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in r) {
    let i = r[t];
    Array.isArray(i) || (i = [i]);
    for (let n of t.split(" "))
      if (n) {
        let s = [], o = 2, l = n;
        for (let f = 0; ; ) {
          if (l == "..." && f > 0 && f + 3 == n.length) {
            o = 1;
            break;
          }
          let d = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);
          if (!d)
            throw new RangeError("Invalid path: " + n);
          if (s.push(d[0] == "*" ? "" : d[0][0] == '"' ? JSON.parse(d[0]) : d[0]), f += d[0].length, f == n.length)
            break;
          let O = n[f++];
          if (f == n.length && O == "!") {
            o = 0;
            break;
          }
          if (O != "/")
            throw new RangeError("Invalid path: " + n);
          l = n.slice(f);
        }
        let a = s.length - 1, h = s[a];
        if (!h)
          throw new RangeError("Invalid path: " + n);
        let c = new Cn(i, o, a > 0 ? s.slice(0, a) : null);
        e[h] = c.sort(e[h]);
      }
  }
  return Rc.add(e);
}
const Rc = new X();
class Cn {
  constructor(e, t, i, n) {
    this.tags = e, this.mode = t, this.context = i, this.next = n;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(e) {
    return !e || e.depth < this.depth ? (this.next = e, this) : (e.next = this.sort(e.next), e);
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
}
Cn.empty = new Cn([], 2, null);
function Xc(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of r)
    if (!Array.isArray(s.tag))
      t[s.tag.id] = s.class;
    else
      for (let o of s.tag)
        t[o.id] = s.class;
  let { scope: i, all: n = null } = e || {};
  return {
    style: (s) => {
      let o = n;
      for (let l of s)
        for (let a of l.set) {
          let h = t[a.id];
          if (h) {
            o = o ? o + " " + h : h;
            break;
          }
        }
      return o;
    },
    scope: i
  };
}
function sp(r, e) {
  let t = null;
  for (let i of r) {
    let n = i.style(e);
    n && (t = t ? t + " " + n : n);
  }
  return t;
}
function op(r, e, t, i = 0, n = r.length) {
  let s = new lp(i, Array.isArray(e) ? e : [e], t);
  s.highlightRange(r.cursor(), i, n, "", s.highlighters), s.flush(n);
}
class lp {
  constructor(e, t, i) {
    this.at = e, this.highlighters = t, this.span = i, this.class = "";
  }
  startSpan(e, t) {
    t != this.class && (this.flush(e), e > this.at && (this.at = e), this.class = t);
  }
  flush(e) {
    e > this.at && this.class && this.span(this.at, e, this.class);
  }
  highlightRange(e, t, i, n, s) {
    let { type: o, from: l, to: a } = e;
    if (l >= i || a <= t)
      return;
    o.isTop && (s = this.highlighters.filter((O) => !O.scope || O.scope(o)));
    let h = n, c = ap(e) || Cn.empty, f = sp(s, c.tags);
    if (f && (h && (h += " "), h += f, c.mode == 1 && (n += (n ? " " : "") + f)), this.startSpan(Math.max(t, l), h), c.opaque)
      return;
    let d = e.tree && e.tree.prop(X.mounted);
    if (d && d.overlay) {
      let O = e.node.enter(d.overlay[0].from + l, 1), p = this.highlighters.filter((g) => !g.scope || g.scope(d.tree.type)), m = e.firstChild();
      for (let g = 0, b = l; ; g++) {
        let S = g < d.overlay.length ? d.overlay[g] : null, k = S ? S.from + l : a, Q = Math.max(t, b), x = Math.min(i, k);
        if (Q < x && m)
          for (; e.from < x && (this.highlightRange(e, Q, x, n, s), this.startSpan(Math.min(x, e.to), h), !(e.to >= k || !e.nextSibling())); )
            ;
        if (!S || k > i)
          break;
        b = S.to + l, b > t && (this.highlightRange(O.cursor(), Math.max(t, S.from + l), Math.min(i, b), "", p), this.startSpan(Math.min(i, b), h));
      }
      m && e.parent();
    } else if (e.firstChild()) {
      d && (n = "");
      do
        if (!(e.to <= t)) {
          if (e.from >= i)
            break;
          this.highlightRange(e, t, i, n, s), this.startSpan(Math.min(i, e.to), h);
        }
      while (e.nextSibling());
      e.parent();
    }
  }
}
function ap(r) {
  let e = r.type.prop(Rc);
  for (; e && e.context && !r.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const P = je.define, Vr = P(), Pt = P(), ha = P(Pt), ca = P(Pt), $t = P(), Br = P($t), us = P($t), nt = P(), Bt = P(nt), tt = P(), it = P(), Gs = P(), Mi = P(Gs), zr = P(), u = {
  /**
  A comment.
  */
  comment: Vr,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: P(Vr),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: P(Vr),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: P(Vr),
  /**
  Any kind of identifier.
  */
  name: Pt,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: P(Pt),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: ha,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: P(ha),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: ca,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: P(ca),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: P(Pt),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: P(Pt),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: P(Pt),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: P(Pt),
  /**
  A literal value.
  */
  literal: $t,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: Br,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: P(Br),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: P(Br),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: P(Br),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: us,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: P(us),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: P(us),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: P($t),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: P($t),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: P($t),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: P($t),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: P($t),
  /**
  A language keyword.
  */
  keyword: tt,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: P(tt),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: P(tt),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: P(tt),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: P(tt),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: P(tt),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: P(tt),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: P(tt),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: P(tt),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: P(tt),
  /**
  An operator.
  */
  operator: it,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: P(it),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: P(it),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: P(it),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: P(it),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: P(it),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: P(it),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: P(it),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: P(it),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: P(it),
  /**
  Program or markup punctuation.
  */
  punctuation: Gs,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: P(Gs),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: Mi,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: P(Mi),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: P(Mi),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: P(Mi),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: P(Mi),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: nt,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: Bt,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: P(Bt),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: P(Bt),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: P(Bt),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: P(Bt),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: P(Bt),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: P(Bt),
  /**
  A prose separator (such as a horizontal rule).
  */
  contentSeparator: P(nt),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: P(nt),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: P(nt),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: P(nt),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: P(nt),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: P(nt),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: P(nt),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: P(nt),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: P(),
  /**
  Deleted text.
  */
  deleted: P(),
  /**
  Changed text.
  */
  changed: P(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: P(),
  /**
  Metadata or meta-instruction.
  */
  meta: zr,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: P(zr),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: P(zr),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: P(zr),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: je.defineModifier(),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: je.defineModifier(),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: je.defineModifier(),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: je.defineModifier(),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: je.defineModifier(),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: je.defineModifier()
};
Xc([
  { tag: u.link, class: "tok-link" },
  { tag: u.heading, class: "tok-heading" },
  { tag: u.emphasis, class: "tok-emphasis" },
  { tag: u.strong, class: "tok-strong" },
  { tag: u.keyword, class: "tok-keyword" },
  { tag: u.atom, class: "tok-atom" },
  { tag: u.bool, class: "tok-bool" },
  { tag: u.url, class: "tok-url" },
  { tag: u.labelName, class: "tok-labelName" },
  { tag: u.inserted, class: "tok-inserted" },
  { tag: u.deleted, class: "tok-deleted" },
  { tag: u.literal, class: "tok-literal" },
  { tag: u.string, class: "tok-string" },
  { tag: u.number, class: "tok-number" },
  { tag: [u.regexp, u.escape, u.special(u.string)], class: "tok-string2" },
  { tag: u.variableName, class: "tok-variableName" },
  { tag: u.local(u.variableName), class: "tok-variableName tok-local" },
  { tag: u.definition(u.variableName), class: "tok-variableName tok-definition" },
  { tag: u.special(u.variableName), class: "tok-variableName2" },
  { tag: u.definition(u.propertyName), class: "tok-propertyName tok-definition" },
  { tag: u.typeName, class: "tok-typeName" },
  { tag: u.namespace, class: "tok-namespace" },
  { tag: u.className, class: "tok-className" },
  { tag: u.macroName, class: "tok-macroName" },
  { tag: u.propertyName, class: "tok-propertyName" },
  { tag: u.operator, class: "tok-operator" },
  { tag: u.comment, class: "tok-comment" },
  { tag: u.meta, class: "tok-meta" },
  { tag: u.invalid, class: "tok-invalid" },
  { tag: u.punctuation, class: "tok-punctuation" }
]);
const hp = 54, cp = 1, fp = 55, up = 2, dp = 56, Op = 3, fa = 4, pp = 5, Zn = 6, Mc = 7, Ec = 8, Wc = 9, Yc = 10, mp = 11, gp = 12, bp = 13, ds = 57, Sp = 14, ua = 58, Dc = 20, yp = 22, qc = 23, xp = 24, Fs = 26, Vc = 27, kp = 28, Qp = 31, wp = 34, Pp = 36, $p = 37, vp = 0, Cp = 1, Zp = {
  area: !0,
  base: !0,
  br: !0,
  col: !0,
  command: !0,
  embed: !0,
  frame: !0,
  hr: !0,
  img: !0,
  input: !0,
  keygen: !0,
  link: !0,
  meta: !0,
  param: !0,
  source: !0,
  track: !0,
  wbr: !0,
  menuitem: !0
}, Tp = {
  dd: !0,
  li: !0,
  optgroup: !0,
  option: !0,
  p: !0,
  rp: !0,
  rt: !0,
  tbody: !0,
  td: !0,
  tfoot: !0,
  th: !0,
  tr: !0
}, da = {
  dd: { dd: !0, dt: !0 },
  dt: { dd: !0, dt: !0 },
  li: { li: !0 },
  option: { option: !0, optgroup: !0 },
  optgroup: { optgroup: !0 },
  p: {
    address: !0,
    article: !0,
    aside: !0,
    blockquote: !0,
    dir: !0,
    div: !0,
    dl: !0,
    fieldset: !0,
    footer: !0,
    form: !0,
    h1: !0,
    h2: !0,
    h3: !0,
    h4: !0,
    h5: !0,
    h6: !0,
    header: !0,
    hgroup: !0,
    hr: !0,
    menu: !0,
    nav: !0,
    ol: !0,
    p: !0,
    pre: !0,
    section: !0,
    table: !0,
    ul: !0
  },
  rp: { rp: !0, rt: !0 },
  rt: { rp: !0, rt: !0 },
  tbody: { tbody: !0, tfoot: !0 },
  td: { td: !0, th: !0 },
  tfoot: { tbody: !0 },
  th: { td: !0, th: !0 },
  thead: { tbody: !0, tfoot: !0 },
  tr: { tr: !0 }
};
function Ap(r) {
  return r == 45 || r == 46 || r == 58 || r >= 65 && r <= 90 || r == 95 || r >= 97 && r <= 122 || r >= 161;
}
function Bc(r) {
  return r == 9 || r == 10 || r == 13 || r == 32;
}
let Oa = null, pa = null, ma = 0;
function Hs(r, e) {
  let t = r.pos + e;
  if (ma == t && pa == r) return Oa;
  let i = r.peek(e);
  for (; Bc(i); ) i = r.peek(++e);
  let n = "";
  for (; Ap(i); )
    n += String.fromCharCode(i), i = r.peek(++e);
  return pa = r, ma = t, Oa = n ? n.toLowerCase() : i == Rp || i == Xp ? void 0 : null;
}
const zc = 60, Tn = 62, rl = 47, Rp = 63, Xp = 33, Mp = 45;
function ga(r, e) {
  this.name = r, this.parent = e;
}
const Ep = [Zn, Yc, Mc, Ec, Wc], Wp = new Ac({
  start: null,
  shift(r, e, t, i) {
    return Ep.indexOf(e) > -1 ? new ga(Hs(i, 1) || "", r) : r;
  },
  reduce(r, e) {
    return e == Dc && r ? r.parent : r;
  },
  reuse(r, e, t, i) {
    let n = e.type.id;
    return n == Zn || n == Pp ? new ga(Hs(i, 1) || "", r) : r;
  },
  strict: !1
}), Yp = new Ke((r, e) => {
  if (r.next != zc) {
    r.next < 0 && e.context && r.acceptToken(ds);
    return;
  }
  r.advance();
  let t = r.next == rl;
  t && r.advance();
  let i = Hs(r, 0);
  if (i === void 0) return;
  if (!i) return r.acceptToken(t ? Sp : Zn);
  let n = e.context ? e.context.name : null;
  if (t) {
    if (i == n) return r.acceptToken(mp);
    if (n && Tp[n]) return r.acceptToken(ds, -2);
    if (e.dialectEnabled(vp)) return r.acceptToken(gp);
    for (let s = e.context; s; s = s.parent) if (s.name == i) return;
    r.acceptToken(bp);
  } else {
    if (i == "script") return r.acceptToken(Mc);
    if (i == "style") return r.acceptToken(Ec);
    if (i == "textarea") return r.acceptToken(Wc);
    if (Zp.hasOwnProperty(i)) return r.acceptToken(Yc);
    n && da[n] && da[n][i] ? r.acceptToken(ds, -1) : r.acceptToken(Zn);
  }
}, { contextual: !0 }), Dp = new Ke((r) => {
  for (let e = 0, t = 0; ; t++) {
    if (r.next < 0) {
      t && r.acceptToken(ua);
      break;
    }
    if (r.next == Mp)
      e++;
    else if (r.next == Tn && e >= 2) {
      t >= 3 && r.acceptToken(ua, -2);
      break;
    } else
      e = 0;
    r.advance();
  }
});
function qp(r) {
  for (; r; r = r.parent)
    if (r.name == "svg" || r.name == "math") return !0;
  return !1;
}
const Vp = new Ke((r, e) => {
  if (r.next == rl && r.peek(1) == Tn) {
    let t = e.dialectEnabled(Cp) || qp(e.context);
    r.acceptToken(t ? pp : fa, 2);
  } else r.next == Tn && r.acceptToken(fa, 1);
});
function nl(r, e, t) {
  let i = 2 + r.length;
  return new Ke((n) => {
    for (let s = 0, o = 0, l = 0; ; l++) {
      if (n.next < 0) {
        l && n.acceptToken(e);
        break;
      }
      if (s == 0 && n.next == zc || s == 1 && n.next == rl || s >= 2 && s < i && n.next == r.charCodeAt(s - 2))
        s++, o++;
      else if ((s == 2 || s == i) && Bc(n.next))
        o++;
      else if (s == i && n.next == Tn) {
        l > o ? n.acceptToken(e, -o) : n.acceptToken(t, -(o - 2));
        break;
      } else if ((n.next == 10 || n.next == 13) && l) {
        n.acceptToken(e, 1);
        break;
      } else
        s = o = 0;
      n.advance();
    }
  });
}
const Bp = nl("script", hp, cp), zp = nl("style", fp, up), Lp = nl("textarea", dp, Op), Np = ii({
  "Text RawText": u.content,
  "StartTag StartCloseTag SelfClosingEndTag EndTag": u.angleBracket,
  TagName: u.tagName,
  "MismatchedCloseTag/TagName": [u.tagName, u.invalid],
  AttributeName: u.attributeName,
  "AttributeValue UnquotedAttributeValue": u.attributeValue,
  Is: u.definitionOperator,
  "EntityReference CharacterReference": u.character,
  Comment: u.blockComment,
  ProcessingInst: u.processingInstruction,
  DoctypeDecl: u.documentMeta
}), _p = Gt.deserialize({
  version: 14,
  states: ",xOVO!rOOO!WQ#tO'#CqO!]Q#tO'#CzO!bQ#tO'#C}O!gQ#tO'#DQO!lQ#tO'#DSO!qOaO'#CpO!|ObO'#CpO#XOdO'#CpO$eO!rO'#CpOOO`'#Cp'#CpO$lO$fO'#DTO$tQ#tO'#DVO$yQ#tO'#DWOOO`'#Dk'#DkOOO`'#DY'#DYQVO!rOOO%OQ&rO,59]O%ZQ&rO,59fO%fQ&rO,59iO%qQ&rO,59lO%|Q&rO,59nOOOa'#D^'#D^O&XOaO'#CxO&dOaO,59[OOOb'#D_'#D_O&lObO'#C{O&wObO,59[OOOd'#D`'#D`O'POdO'#DOO'[OdO,59[OOO`'#Da'#DaO'dO!rO,59[O'kQ#tO'#DROOO`,59[,59[OOOp'#Db'#DbO'pO$fO,59oOOO`,59o,59oO'xQ#|O,59qO'}Q#|O,59rOOO`-E7W-E7WO(SQ&rO'#CsOOQW'#DZ'#DZO(bQ&rO1G.wOOOa1G.w1G.wOOO`1G/Y1G/YO(mQ&rO1G/QOOOb1G/Q1G/QO(xQ&rO1G/TOOOd1G/T1G/TO)TQ&rO1G/WOOO`1G/W1G/WO)`Q&rO1G/YOOOa-E7[-E7[O)kQ#tO'#CyOOO`1G.v1G.vOOOb-E7]-E7]O)pQ#tO'#C|OOOd-E7^-E7^O)uQ#tO'#DPOOO`-E7_-E7_O)zQ#|O,59mOOOp-E7`-E7`OOO`1G/Z1G/ZOOO`1G/]1G/]OOO`1G/^1G/^O*PQ,UO,59_OOQW-E7X-E7XOOOa7+$c7+$cOOO`7+$t7+$tOOOb7+$l7+$lOOOd7+$o7+$oOOO`7+$r7+$rO*[Q#|O,59eO*aQ#|O,59hO*fQ#|O,59kOOO`1G/X1G/XO*kO7[O'#CvO*|OMhO'#CvOOQW1G.y1G.yOOO`1G/P1G/POOO`1G/S1G/SOOO`1G/V1G/VOOOO'#D['#D[O+_O7[O,59bOOQW,59b,59bOOOO'#D]'#D]O+pOMhO,59bOOOO-E7Y-E7YOOQW1G.|1G.|OOOO-E7Z-E7Z",
  stateData: ",]~O!^OS~OUSOVPOWQOXROYTO[]O][O^^O`^Oa^Ob^Oc^Ox^O{_O!dZO~OfaO~OfbO~OfcO~OfdO~OfeO~O!WfOPlP!ZlP~O!XiOQoP!ZoP~O!YlORrP!ZrP~OUSOVPOWQOXROYTOZqO[]O][O^^O`^Oa^Ob^Oc^Ox^O!dZO~O!ZrO~P#dO![sO!euO~OfvO~OfwO~OS|OT}OhyO~OS!POT}OhyO~OS!ROT}OhyO~OS!TOT}OhyO~OS}OT}OhyO~O!WfOPlX!ZlX~OP!WO!Z!XO~O!XiOQoX!ZoX~OQ!ZO!Z!XO~O!YlORrX!ZrX~OR!]O!Z!XO~O!Z!XO~P#dOf!_O~O![sO!e!aO~OS!bO~OS!cO~Oi!dOSgXTgXhgX~OS!fOT!gOhyO~OS!hOT!gOhyO~OS!iOT!gOhyO~OS!jOT!gOhyO~OS!gOT!gOhyO~Of!kO~Of!lO~Of!mO~OS!nO~Ok!qO!`!oO!b!pO~OS!rO~OS!sO~OS!tO~Oa!uOb!uOc!uO!`!wO!a!uO~Oa!xOb!xOc!xO!b!wO!c!xO~Oa!uOb!uOc!uO!`!{O!a!uO~Oa!xOb!xOc!xO!b!{O!c!xO~OT~bac!dx{!d~",
  goto: "%p!`PPPPPPPPPPPPPPPPPPPP!a!gP!mPP!yP!|#P#S#Y#]#`#f#i#l#r#x!aP!a!aP$O$U$l$r$x%O%U%[%bPPPPPPPP%hX^OX`pXUOX`pezabcde{!O!Q!S!UR!q!dRhUR!XhXVOX`pRkVR!XkXWOX`pRnWR!XnXXOX`pQrXR!XpXYOX`pQ`ORx`Q{aQ!ObQ!QcQ!SdQ!UeZ!e{!O!Q!S!UQ!v!oR!z!vQ!y!pR!|!yQgUR!VgQjVR!YjQmWR![mQpXR!^pQtZR!`tS_O`ToXp",
  nodeNames: "⚠ StartCloseTag StartCloseTag StartCloseTag EndTag SelfClosingEndTag StartTag StartTag StartTag StartTag StartTag StartCloseTag StartCloseTag StartCloseTag IncompleteCloseTag Document Text EntityReference CharacterReference InvalidEntity Element OpenTag TagName Attribute AttributeName Is AttributeValue UnquotedAttributeValue ScriptText CloseTag OpenTag StyleText CloseTag OpenTag TextareaText CloseTag OpenTag CloseTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag CloseTag DoctypeDecl",
  maxTerm: 67,
  context: Wp,
  nodeProps: [
    ["closedBy", -10, 1, 2, 3, 7, 8, 9, 10, 11, 12, 13, "EndTag", 6, "EndTag SelfClosingEndTag", -4, 21, 30, 33, 36, "CloseTag"],
    ["openedBy", 4, "StartTag StartCloseTag", 5, "StartTag", -4, 29, 32, 35, 37, "OpenTag"],
    ["group", -9, 14, 17, 18, 19, 20, 39, 40, 41, 42, "Entity", 16, "Entity TextContent", -3, 28, 31, 34, "TextContent Entity"],
    ["isolate", -11, 21, 29, 30, 32, 33, 35, 36, 37, 38, 41, 42, "ltr", -3, 26, 27, 39, ""]
  ],
  propSources: [Np],
  skippedNodes: [0],
  repeatNodeCount: 9,
  tokenData: "!<p!aR!YOX$qXY,QYZ,QZ[$q[]&X]^,Q^p$qpq,Qqr-_rs3_sv-_vw3}wxHYx}-_}!OH{!O!P-_!P!Q$q!Q![-_![!]Mz!]!^-_!^!_!$S!_!`!;x!`!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4U-_4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!Z$|c`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr$qrs&}sv$qvw+Pwx(tx!^$q!^!_*V!_!a&X!a#S$q#S#T&X#T;'S$q;'S;=`+z<%lO$q!R&bX`P!a`!cpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&Xq'UV`P!cpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}P'pT`POv'kw!^'k!_;'S'k;'S;=`(P<%lO'kP(SP;=`<%l'kp([S!cpOv(Vx;'S(V;'S;=`(h<%lO(Vp(kP;=`<%l(Vq(qP;=`<%l&}a({W`P!a`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t`)jT!a`Or)esv)ew;'S)e;'S;=`)y<%lO)e`)|P;=`<%l)ea*SP;=`<%l(t!Q*^V!a`!cpOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!Q*vP;=`<%l*V!R*|P;=`<%l&XW+UYkWOX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+PW+wP;=`<%l+P!Z+}P;=`<%l$q!a,]``P!a`!cp!^^OX&XXY,QYZ,QZ]&X]^,Q^p&Xpq,Qqr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!_-ljhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q[/ebhSkWOX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+PS0rXhSqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0mS1bP;=`<%l0m[1hP;=`<%l/^!V1vchS`P!a`!cpOq&Xqr1krs&}sv1kvw0mwx(tx!P1k!P!Q&X!Q!^1k!^!_*V!_!a&X!a#s1k#s$f&X$f;'S1k;'S;=`3R<%l?Ah1k?Ah?BY&X?BY?Mn1k?MnO&X!V3UP;=`<%l1k!_3[P;=`<%l-_!Z3hV!`h`P!cpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}!_4WihSkWc!ROX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst>]tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^/^!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!Z5zbkWOX5uXZ7SZ[5u[^7S^p5uqr5urs7Sst+Ptw5uwx7Sx!]5u!]!^7w!^!a7S!a#S5u#S#T7S#T;'S5u;'S;=`8n<%lO5u!R7VVOp7Sqs7St!]7S!]!^7l!^;'S7S;'S;=`7q<%lO7S!R7qOa!R!R7tP;=`<%l7S!Z8OYkWa!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!Z8qP;=`<%l5u!_8{ihSkWOX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst/^tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^:j!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!_:sbhSkWa!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!V<QchSOp7Sqr;{rs7Sst0mtw;{wx7Sx!P;{!P!Q7S!Q!];{!]!^=]!^!a7S!a#s;{#s$f7S$f;'S;{;'S;=`>P<%l?Ah;{?Ah?BY7S?BY?Mn;{?MnO7S!V=dXhSa!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!V>SP;=`<%l;{!_>YP;=`<%l8t!_>dhhSkWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^/^!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!Z@TakWOX@OXZAYZ[@O[^AY^p@Oqr@OrsAYsw@OwxAYx!]@O!]!^Az!^!aAY!a#S@O#S#TAY#T;'S@O;'S;=`Bq<%lO@O!RA]UOpAYq!]AY!]!^Ao!^;'SAY;'S;=`At<%lOAY!RAtOb!R!RAwP;=`<%lAY!ZBRYkWb!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!ZBtP;=`<%l@O!_COhhSkWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^Dj!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!_DsbhSkWb!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!VFQbhSOpAYqrE{rsAYswE{wxAYx!PE{!P!QAY!Q!]E{!]!^GY!^!aAY!a#sE{#s$fAY$f;'SE{;'S;=`G|<%l?AhE{?Ah?BYAY?BY?MnE{?MnOAY!VGaXhSb!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!VHPP;=`<%lE{!_HVP;=`<%lBw!ZHcW!bx`P!a`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t!aIYlhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OKQ!O!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!aK_khS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!`&X!`!aMS!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!TM_X`P!a`!cp!eQOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!aNZ!ZhSfQ`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OMz!O!PMz!P!Q$q!Q![Mz![!]Mz!]!^-_!^!_*V!_!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f$}-_$}%OMz%O%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4UMz4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Je-_$Je$JgMz$Jg$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!a!$PP;=`<%lMz!R!$ZY!a`!cpOq*Vqr!$yrs(Vsv*Vwx)ex!a*V!a!b!4t!b;'S*V;'S;=`*s<%lO*V!R!%Q]!a`!cpOr*Vrs(Vsv*Vwx)ex}*V}!O!%y!O!f*V!f!g!']!g#W*V#W#X!0`#X;'S*V;'S;=`*s<%lO*V!R!&QX!a`!cpOr*Vrs(Vsv*Vwx)ex}*V}!O!&m!O;'S*V;'S;=`*s<%lO*V!R!&vV!a`!cp!dPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!'dX!a`!cpOr*Vrs(Vsv*Vwx)ex!q*V!q!r!(P!r;'S*V;'S;=`*s<%lO*V!R!(WX!a`!cpOr*Vrs(Vsv*Vwx)ex!e*V!e!f!(s!f;'S*V;'S;=`*s<%lO*V!R!(zX!a`!cpOr*Vrs(Vsv*Vwx)ex!v*V!v!w!)g!w;'S*V;'S;=`*s<%lO*V!R!)nX!a`!cpOr*Vrs(Vsv*Vwx)ex!{*V!{!|!*Z!|;'S*V;'S;=`*s<%lO*V!R!*bX!a`!cpOr*Vrs(Vsv*Vwx)ex!r*V!r!s!*}!s;'S*V;'S;=`*s<%lO*V!R!+UX!a`!cpOr*Vrs(Vsv*Vwx)ex!g*V!g!h!+q!h;'S*V;'S;=`*s<%lO*V!R!+xY!a`!cpOr!+qrs!,hsv!+qvw!-Swx!.[x!`!+q!`!a!/j!a;'S!+q;'S;=`!0Y<%lO!+qq!,mV!cpOv!,hvx!-Sx!`!,h!`!a!-q!a;'S!,h;'S;=`!.U<%lO!,hP!-VTO!`!-S!`!a!-f!a;'S!-S;'S;=`!-k<%lO!-SP!-kO{PP!-nP;=`<%l!-Sq!-xS!cp{POv(Vx;'S(V;'S;=`(h<%lO(Vq!.XP;=`<%l!,ha!.aX!a`Or!.[rs!-Ssv!.[vw!-Sw!`!.[!`!a!.|!a;'S!.[;'S;=`!/d<%lO!.[a!/TT!a`{POr)esv)ew;'S)e;'S;=`)y<%lO)ea!/gP;=`<%l!.[!R!/sV!a`!cp{POr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!0]P;=`<%l!+q!R!0gX!a`!cpOr*Vrs(Vsv*Vwx)ex#c*V#c#d!1S#d;'S*V;'S;=`*s<%lO*V!R!1ZX!a`!cpOr*Vrs(Vsv*Vwx)ex#V*V#V#W!1v#W;'S*V;'S;=`*s<%lO*V!R!1}X!a`!cpOr*Vrs(Vsv*Vwx)ex#h*V#h#i!2j#i;'S*V;'S;=`*s<%lO*V!R!2qX!a`!cpOr*Vrs(Vsv*Vwx)ex#m*V#m#n!3^#n;'S*V;'S;=`*s<%lO*V!R!3eX!a`!cpOr*Vrs(Vsv*Vwx)ex#d*V#d#e!4Q#e;'S*V;'S;=`*s<%lO*V!R!4XX!a`!cpOr*Vrs(Vsv*Vwx)ex#X*V#X#Y!+q#Y;'S*V;'S;=`*s<%lO*V!R!4{Y!a`!cpOr!4trs!5ksv!4tvw!6Vwx!8]x!a!4t!a!b!:]!b;'S!4t;'S;=`!;r<%lO!4tq!5pV!cpOv!5kvx!6Vx!a!5k!a!b!7W!b;'S!5k;'S;=`!8V<%lO!5kP!6YTO!a!6V!a!b!6i!b;'S!6V;'S;=`!7Q<%lO!6VP!6lTO!`!6V!`!a!6{!a;'S!6V;'S;=`!7Q<%lO!6VP!7QOxPP!7TP;=`<%l!6Vq!7]V!cpOv!5kvx!6Vx!`!5k!`!a!7r!a;'S!5k;'S;=`!8V<%lO!5kq!7yS!cpxPOv(Vx;'S(V;'S;=`(h<%lO(Vq!8YP;=`<%l!5ka!8bX!a`Or!8]rs!6Vsv!8]vw!6Vw!a!8]!a!b!8}!b;'S!8];'S;=`!:V<%lO!8]a!9SX!a`Or!8]rs!6Vsv!8]vw!6Vw!`!8]!`!a!9o!a;'S!8];'S;=`!:V<%lO!8]a!9vT!a`xPOr)esv)ew;'S)e;'S;=`)y<%lO)ea!:YP;=`<%l!8]!R!:dY!a`!cpOr!4trs!5ksv!4tvw!6Vwx!8]x!`!4t!`!a!;S!a;'S!4t;'S;=`!;r<%lO!4t!R!;]V!a`!cpxPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!;uP;=`<%l!4t!V!<TXiS`P!a`!cpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X",
  tokenizers: [Bp, zp, Lp, Vp, Yp, Dp, 0, 1, 2, 3, 4, 5],
  topRules: { Document: [0, 15] },
  dialects: { noMatch: 0, selfClosing: 509 },
  tokenPrec: 511
});
function Lc(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let i of r.getChildren(qc)) {
    let n = i.getChild(xp), s = i.getChild(Fs) || i.getChild(Vc);
    n && (t[e.read(n.from, n.to)] = s ? s.type.id == Fs ? e.read(s.from + 1, s.to - 1) : e.read(s.from, s.to) : "");
  }
  return t;
}
function ba(r, e) {
  let t = r.getChild(yp);
  return t ? e.read(t.from, t.to) : " ";
}
function Os(r, e, t) {
  let i;
  for (let n of t)
    if (!n.attrs || n.attrs(i || (i = Lc(r.node.parent.firstChild, e))))
      return { parser: n.parser };
  return null;
}
function Nc(r = [], e = []) {
  let t = [], i = [], n = [], s = [];
  for (let l of r)
    (l.tag == "script" ? t : l.tag == "style" ? i : l.tag == "textarea" ? n : s).push(l);
  let o = e.length ? /* @__PURE__ */ Object.create(null) : null;
  for (let l of e) (o[l.name] || (o[l.name] = [])).push(l);
  return Zc((l, a) => {
    let h = l.type.id;
    if (h == kp) return Os(l, a, t);
    if (h == Qp) return Os(l, a, i);
    if (h == wp) return Os(l, a, n);
    if (h == Dc && s.length) {
      let c = l.node, f = c.firstChild, d = f && ba(f, a), O;
      if (d) {
        for (let p of s)
          if (p.tag == d && (!p.attrs || p.attrs(O || (O = Lc(f, a))))) {
            let m = c.lastChild, g = m.type.id == $p ? m.from : c.to;
            if (g > f.to)
              return { parser: p.parser, overlay: [{ from: f.to, to: g }] };
          }
      }
    }
    if (o && h == qc) {
      let c = l.node, f;
      if (f = c.firstChild) {
        let d = o[a.read(f.from, f.to)];
        if (d) for (let O of d) {
          if (O.tagName && O.tagName != ba(c.parent, a)) continue;
          let p = c.lastChild;
          if (p.type.id == Fs) {
            let m = p.from + 1, g = p.lastChild, b = p.to - (g && g.isError ? 0 : 1);
            if (b > m) return { parser: O.parser, overlay: [{ from: m, to: b }] };
          } else if (p.type.id == Vc)
            return { parser: O.parser, overlay: [{ from: p.from, to: p.to }] };
        }
      }
    }
    return null;
  });
}
const Up = 99, Sa = 1, Ip = 100, jp = 101, ya = 2, _c = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
], Gp = 58, Fp = 40, Uc = 95, Hp = 91, dn = 45, Kp = 46, Jp = 35, em = 37, tm = 38, im = 92, rm = 10;
function nr(r) {
  return r >= 65 && r <= 90 || r >= 97 && r <= 122 || r >= 161;
}
function Ic(r) {
  return r >= 48 && r <= 57;
}
const nm = new Ke((r, e) => {
  for (let t = !1, i = 0, n = 0; ; n++) {
    let { next: s } = r;
    if (nr(s) || s == dn || s == Uc || t && Ic(s))
      !t && (s != dn || n > 0) && (t = !0), i === n && s == dn && i++, r.advance();
    else if (s == im && r.peek(1) != rm)
      r.advance(), r.next > -1 && r.advance(), t = !0;
    else {
      t && r.acceptToken(s == Fp ? Ip : i == 2 && e.canShift(ya) ? ya : jp);
      break;
    }
  }
}), sm = new Ke((r) => {
  if (_c.includes(r.peek(-1))) {
    let { next: e } = r;
    (nr(e) || e == Uc || e == Jp || e == Kp || e == Hp || e == Gp && nr(r.peek(1)) || e == dn || e == tm) && r.acceptToken(Up);
  }
}), om = new Ke((r) => {
  if (!_c.includes(r.peek(-1))) {
    let { next: e } = r;
    if (e == em && (r.advance(), r.acceptToken(Sa)), nr(e)) {
      do
        r.advance();
      while (nr(r.next) || Ic(r.next));
      r.acceptToken(Sa);
    }
  }
}), lm = ii({
  "AtKeyword import charset namespace keyframes media supports": u.definitionKeyword,
  "from to selector": u.keyword,
  NamespaceName: u.namespace,
  KeyframeName: u.labelName,
  KeyframeRangeName: u.operatorKeyword,
  TagName: u.tagName,
  ClassName: u.className,
  PseudoClassName: u.constant(u.className),
  IdName: u.labelName,
  "FeatureName PropertyName": u.propertyName,
  AttributeName: u.attributeName,
  NumberLiteral: u.number,
  KeywordQuery: u.keyword,
  UnaryQueryOp: u.operatorKeyword,
  "CallTag ValueName": u.atom,
  VariableName: u.variableName,
  Callee: u.operatorKeyword,
  Unit: u.unit,
  "UniversalSelector NestingSelector": u.definitionOperator,
  MatchOp: u.compareOperator,
  "ChildOp SiblingOp, LogicOp": u.logicOperator,
  BinOp: u.arithmeticOperator,
  Important: u.modifier,
  Comment: u.blockComment,
  ColorLiteral: u.color,
  "ParenthesizedContent StringLiteral": u.string,
  ":": u.punctuation,
  "PseudoOp #": u.derefOperator,
  "; ,": u.separator,
  "( )": u.paren,
  "[ ]": u.squareBracket,
  "{ }": u.brace
}), am = { __proto__: null, lang: 32, "nth-child": 32, "nth-last-child": 32, "nth-of-type": 32, "nth-last-of-type": 32, dir: 32, "host-context": 32, url: 60, "url-prefix": 60, domain: 60, regexp: 60, selector: 138 }, hm = { __proto__: null, "@import": 118, "@media": 142, "@charset": 146, "@namespace": 150, "@keyframes": 156, "@supports": 168 }, cm = { __proto__: null, not: 132, only: 132 }, fm = Gt.deserialize({
  version: 14,
  states: ":^QYQ[OOO#_Q[OOP#fOWOOOOQP'#Cd'#CdOOQP'#Cc'#CcO#kQ[O'#CfO$_QXO'#CaO$fQ[O'#ChO$qQ[O'#DTO$vQ[O'#DWOOQP'#Em'#EmO${QdO'#DgO%jQ[O'#DtO${QdO'#DvO%{Q[O'#DxO&WQ[O'#D{O&`Q[O'#ERO&nQ[O'#ETOOQS'#El'#ElOOQS'#EW'#EWQYQ[OOO&uQXO'#CdO'jQWO'#DcO'oQWO'#EsO'zQ[O'#EsQOQWOOP(UO#tO'#C_POOO)C@[)C@[OOQP'#Cg'#CgOOQP,59Q,59QO#kQ[O,59QO(aQ[O'#E[O({QWO,58{O)TQ[O,59SO$qQ[O,59oO$vQ[O,59rO(aQ[O,59uO(aQ[O,59wO(aQ[O,59xO)`Q[O'#DbOOQS,58{,58{OOQP'#Ck'#CkOOQO'#DR'#DROOQP,59S,59SO)gQWO,59SO)lQWO,59SOOQP'#DV'#DVOOQP,59o,59oOOQO'#DX'#DXO)qQ`O,59rOOQS'#Cp'#CpO${QdO'#CqO)yQvO'#CsO+ZQtO,5:ROOQO'#Cx'#CxO)lQWO'#CwO+oQWO'#CyO+tQ[O'#DOOOQS'#Ep'#EpOOQO'#Dj'#DjO+|Q[O'#DqO,[QWO'#EtO&`Q[O'#DoO,jQWO'#DrOOQO'#Eu'#EuO)OQWO,5:`O,oQpO,5:bOOQS'#Dz'#DzO,wQWO,5:dO,|Q[O,5:dOOQO'#D}'#D}O-UQWO,5:gO-ZQWO,5:mO-cQWO,5:oOOQS-E8U-E8UO${QdO,59}O-kQ[O'#E^O-xQWO,5;_O-xQWO,5;_POOO'#EV'#EVP.TO#tO,58yPOOO,58y,58yOOQP1G.l1G.lO.zQXO,5:vOOQO-E8Y-E8YOOQS1G.g1G.gOOQP1G.n1G.nO)gQWO1G.nO)lQWO1G.nOOQP1G/Z1G/ZO/XQ`O1G/^O/rQXO1G/aO0YQXO1G/cO0pQXO1G/dO1WQWO,59|O1]Q[O'#DSO1dQdO'#CoOOQP1G/^1G/^O${QdO1G/^O1kQpO,59]OOQS,59_,59_O${QdO,59aO1sQWO1G/mOOQS,59c,59cO1xQ!bO,59eOOQS'#DP'#DPOOQS'#EY'#EYO2QQ[O,59jOOQS,59j,59jO2YQWO'#DjO2eQWO,5:VO2jQWO,5:]O&`Q[O,5:XO&`Q[O'#E_O2rQWO,5;`O2}QWO,5:ZO(aQ[O,5:^OOQS1G/z1G/zOOQS1G/|1G/|OOQS1G0O1G0OO3`QWO1G0OO3eQdO'#EOOOQS1G0R1G0ROOQS1G0X1G0XOOQS1G0Z1G0ZO3pQtO1G/iOOQO,5:x,5:xO4WQ[O,5:xOOQO-E8[-E8[O4eQWO1G0yPOOO-E8T-E8TPOOO1G.e1G.eOOQP7+$Y7+$YOOQP7+$x7+$xO${QdO7+$xOOQS1G/h1G/hO4pQXO'#ErO4wQWO,59nO4|QtO'#EXO5tQdO'#EoO6OQWO,59ZO6TQpO7+$xOOQS1G.w1G.wOOQS1G.{1G.{OOQS7+%X7+%XO6]QWO1G/POOQS-E8W-E8WOOQS1G/U1G/UO${QdO1G/qOOQO1G/w1G/wOOQO1G/s1G/sO6bQWO,5:yOOQO-E8]-E8]O6pQXO1G/xOOQS7+%j7+%jO6wQYO'#CsOOQO'#EQ'#EQO7SQ`O'#EPOOQO'#EP'#EPO7_QWO'#E`O7gQdO,5:jOOQS,5:j,5:jO7rQtO'#E]O${QdO'#E]O8sQdO7+%TOOQO7+%T7+%TOOQO1G0d1G0dO9WQpO<<HdO9`QWO,5;^OOQP1G/Y1G/YOOQS-E8V-E8VO${QdO'#EZO9hQWO,5;ZOOQT1G.u1G.uOOQP<<Hd<<HdOOQS7+$k7+$kO9pQdO7+%]OOQO7+%d7+%dOOQO,5:k,5:kO3hQdO'#EaO7_QWO,5:zOOQS,5:z,5:zOOQS-E8^-E8^OOQS1G0U1G0UO9wQtO,5:wOOQS-E8Z-E8ZOOQO<<Ho<<HoOOQPAN>OAN>OO:xQdO,5:uOOQO-E8X-E8XOOQO<<Hw<<HwOOQO,5:{,5:{OOQO-E8_-E8_OOQS1G0f1G0f",
  stateData: ";[~O#ZOS#[QQ~OUYOXYO]VO^VOqXOxWO![aO!]ZO!i[O!k]O!m^O!p_O!v`O#XRO#bTO~OQfOUYOXYO]VO^VOqXOxWO![aO!]ZO!i[O!k]O!m^O!p_O!v`O#XeO#bTO~O#U#gP~P!ZO#[jO~O#XlO~O]qO^qOqsOtoOxrO!OtO!RvO#VuO#bnO~O!TwO~P#pO`}O#WzO#XyO~O#X!OO~O#X!QO~OQ![Ob!TOf![Oh![On!YOq!ZO#W!WO#X!SO#e!UO~Ob!^O!d!`O!g!aO#X!]O!T#hP~Oh!fOn!YO#X!eO~Oh!hO#X!hO~Ob!^O!d!`O!g!aO#X!]O~O!Y#hP~P%jO]WX]!WX^WXqWXtWXxWX!OWX!RWX!TWX#VWX#bWX~O]!mO~O!Y!nO#U#gX!S#gX~O#U#gX!S#gX~P!ZO#]!qO#^!qO#_!sO~OUYOXYO]VO^VOqXOxWO#XRO#bTO~OtoO!TwO~O`!zO#WzO#XyO~O!S#gP~P!ZOb#RO~Ob#SO~Op#TO|#UO~OP#WObgXjgX!YgX!dgX!ggX#XgXagXQgXfgXhgXngXqgXtgX!XgX#UgX#WgX#egXpgX!SgX~Ob!^Oj#XO!d!`O!g!aO#X!]O!Y#hP~Ob#[O~Op#`O#X#]O~Ob!^O!d!`O!g!aO#X#aO~Ot#eO!b#dO!T#hX!Y#hX~Ob#hO~Oj#XO!Y#jO~O!Y#kO~Oh#lOn!YO~O!T#mO~O!TwO!b#dO~O!TwO!Y#pO~O!Y#QX#U#QX!S#QX~P!ZO!Y!nO#U#ga!S#ga~O#]!qO#^!qO#_#wO~O]qO^qOqsOxrO!OtO!RvO#VuO#bnO~Ot#Oa!T#Oaa#Oa~P.`Op#yO|#zO~O]qO^qOqsOxrO#bnO~Ot}i!O}i!R}i!T}i#V}ia}i~P/aOt!Pi!O!Pi!R!Pi!T!Pi#V!Pia!Pi~P/aOt!Qi!O!Qi!R!Qi!T!Qi#V!Qia!Qi~P/aO!S#{O~Oa#fP~P(aOa#cP~P${Oa$SOj#XO~O!Y$UO~Oh$VOo$VO~Op$XO#X#]O~O]!`Xa!^X!b!^X~O]$YO~Oa$ZO!b#dO~Ot#eO!T#ha!Y#ha~O!b#dOt!ca!T!ca!Y!caa!ca~O!Y$`O~O!S$gO#X$bO#e$aO~Oj#XOt$iO!X$kO!Y!Vi#U!Vi!S!Vi~P${O!Y#Qa#U#Qa!S#Qa~P!ZO!Y!nO#U#gi!S#gi~Oa#fX~P#pOa$oO~Oj#XOQ!{Xa!{Xb!{Xf!{Xh!{Xn!{Xq!{Xt!{X#W!{X#X!{X#e!{X~Ot$qOa#cX~P${Oa$sO~Oj#XOp$tO~Oa$uO~O!b#dOt#Ra!T#Ra!Y#Ra~Oa$wO~P.`OP#WOtgX!TgX~O#e$aOt!sX!T!sX~Ot$yO!TwO~O!S$}O#X$bO#e$aO~Oj#XOQ#PXb#PXf#PXh#PXn#PXq#PXt#PX!X#PX!Y#PX#U#PX#W#PX#X#PX#e#PX!S#PX~Ot$iO!X%QO!Y!Vq#U!Vq!S!Vq~P${Oj#XOp%RO~OtoOa#fa~Ot$qOa#ca~Oa%UO~P${Oj#XOQ#Pab#Paf#Pah#Pan#Paq#Pat#Pa!X#Pa!Y#Pa#U#Pa#W#Pa#X#Pa#e#Pa!S#Pa~Oa!}at!}a~P${O#Zo#[#ej!R#e~",
  goto: "-g#jPPP#kP#nP#w$WP#w$g#wPP$mPPP$s$|$|P%`P$|P$|%z&^PPPP$|&vP&z'Q#wP'W#w'^P#wP#w#wPPP'd'y(WPP#nPP(_(_(i(_P(_P(_(_P#nP#nP#nP(l#nP(o(r(u(|#nP#nP)R)X)h)v)|*S*^*d*n*t*zPPPPPPPPPP+Q+ZP+v+yP,o,r,x-RRkQ_bOPdhw!n#skYOPdhotuvw!n#R#h#skSOPdhotuvw!n#R#h#sQmTR!tnQ{VR!xqQ!x}Q#Z!XR#x!zq![Z]!T!m#S#U#X#q#z$P$Y$i$j$q$v%Sp![Z]!T!m#S#U#X#q#z$P$Y$i$j$q$v%SU$d#m$f$yR$x$cq!XZ]!T!m#S#U#X#q#z$P$Y$i$j$q$v%Sp![Z]!T!m#S#U#X#q#z$P$Y$i$j$q$v%SQ!f^R#l!gT#^!Z#_Q|VR!yqQ!x|R#x!yQ!PWR!{rQ!RXR!|sQxUQ!wpQ#i!cQ#o!jQ#p!kQ${$eR%X$zSgPwQ!phQ#r!nR$l#sZfPhw!n#sa!b[`a!V!^!`#d#eR#b!^R!g^R!i_R#n!iS$e#m$fR%V$yV$c#m$f$yQ!rjR#v!rQdOShPwU!ldh#sR#s!nQ$P#SU$p$P$v%SQ$v$YR%S$qQ#_!ZR$W#_Q$r$PR%T$rQpUS!vp$nR$n#|Q$j#qR%P$jQ!ogS#t!o#uR#u!pQ#f!_R$^#fQ$f#mR$|$fQ$z$eR%W$z_cOPdhw!n#s^UOPdhw!n#sQ!uoQ!}tQ#OuQ#PvQ#|#RR$_#hR$Q#SQ!VZQ!d]Q#V!TQ#q!m[$O#S$P$Y$q$v%SQ$R#UQ$T#XS$h#q$jQ$m#zR%O$iR#}#RQiPR#QwQ!c[Q!kaR#Y!VU!_[a!VQ!j`Q#c!^Q#g!`Q$[#dR$]#e",
  nodeNames: "⚠ Unit VariableName Comment StyleSheet RuleSet UniversalSelector TagSelector TagName NestingSelector ClassSelector ClassName PseudoClassSelector : :: PseudoClassName PseudoClassName ) ( ArgList ValueName ParenthesizedValue ColorLiteral NumberLiteral StringLiteral BinaryExpression BinOp CallExpression Callee CallLiteral CallTag ParenthesizedContent ] [ LineNames LineName , PseudoClassName ArgList IdSelector # IdName AttributeSelector AttributeName MatchOp ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp } { Block Declaration PropertyName Important ; ImportStatement AtKeyword import KeywordQuery FeatureQuery FeatureName BinaryQuery LogicOp UnaryQuery UnaryQueryOp ParenthesizedQuery SelectorQuery selector MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList KeyframeSelector KeyframeRangeName SupportsStatement supports AtRule Styles",
  maxTerm: 117,
  nodeProps: [
    ["isolate", -2, 3, 24, ""],
    ["openedBy", 17, "(", 32, "[", 50, "{"],
    ["closedBy", 18, ")", 33, "]", 51, "}"]
  ],
  propSources: [lm],
  skippedNodes: [0, 3, 87],
  repeatNodeCount: 11,
  tokenData: "J^~R!^OX$}X^%u^p$}pq%uqr)Xrs.Rst/utu6duv$}vw7^wx7oxy9^yz9oz{9t{|:_|}?Q}!O?c!O!P@Q!P!Q@i!Q![Ab![!]B]!]!^CX!^!_$}!_!`Cj!`!aC{!a!b$}!b!cDw!c!}$}!}#OFa#O#P$}#P#QFr#Q#R6d#R#T$}#T#UGT#U#c$}#c#dHf#d#o$}#o#pH{#p#q6d#q#rI^#r#sIo#s#y$}#y#z%u#z$f$}$f$g%u$g#BY$}#BY#BZ%u#BZ$IS$}$IS$I_%u$I_$I|$}$I|$JO%u$JO$JT$}$JT$JU%u$JU$KV$}$KV$KW%u$KW&FU$}&FU&FV%u&FV;'S$};'S;=`JW<%lO$}`%QSOy%^z;'S%^;'S;=`%o<%lO%^`%cSo`Oy%^z;'S%^;'S;=`%o<%lO%^`%rP;=`<%l%^~%zh#Z~OX%^X^'f^p%^pq'fqy%^z#y%^#y#z'f#z$f%^$f$g'f$g#BY%^#BY#BZ'f#BZ$IS%^$IS$I_'f$I_$I|%^$I|$JO'f$JO$JT%^$JT$JU'f$JU$KV%^$KV$KW'f$KW&FU%^&FU&FV'f&FV;'S%^;'S;=`%o<%lO%^~'mh#Z~o`OX%^X^'f^p%^pq'fqy%^z#y%^#y#z'f#z$f%^$f$g'f$g#BY%^#BY#BZ'f#BZ$IS%^$IS$I_'f$I_$I|%^$I|$JO'f$JO$JT%^$JT$JU'f$JU$KV%^$KV$KW'f$KW&FU%^&FU&FV'f&FV;'S%^;'S;=`%o<%lO%^l)[UOy%^z#]%^#]#^)n#^;'S%^;'S;=`%o<%lO%^l)sUo`Oy%^z#a%^#a#b*V#b;'S%^;'S;=`%o<%lO%^l*[Uo`Oy%^z#d%^#d#e*n#e;'S%^;'S;=`%o<%lO%^l*sUo`Oy%^z#c%^#c#d+V#d;'S%^;'S;=`%o<%lO%^l+[Uo`Oy%^z#f%^#f#g+n#g;'S%^;'S;=`%o<%lO%^l+sUo`Oy%^z#h%^#h#i,V#i;'S%^;'S;=`%o<%lO%^l,[Uo`Oy%^z#T%^#T#U,n#U;'S%^;'S;=`%o<%lO%^l,sUo`Oy%^z#b%^#b#c-V#c;'S%^;'S;=`%o<%lO%^l-[Uo`Oy%^z#h%^#h#i-n#i;'S%^;'S;=`%o<%lO%^l-uS!X[o`Oy%^z;'S%^;'S;=`%o<%lO%^~.UWOY.RZr.Rrs.ns#O.R#O#P.s#P;'S.R;'S;=`/o<%lO.R~.sOh~~.vRO;'S.R;'S;=`/P;=`O.R~/SXOY.RZr.Rrs.ns#O.R#O#P.s#P;'S.R;'S;=`/o;=`<%l.R<%lO.R~/rP;=`<%l.Rn/zYxQOy%^z!Q%^!Q![0j![!c%^!c!i0j!i#T%^#T#Z0j#Z;'S%^;'S;=`%o<%lO%^l0oYo`Oy%^z!Q%^!Q![1_![!c%^!c!i1_!i#T%^#T#Z1_#Z;'S%^;'S;=`%o<%lO%^l1dYo`Oy%^z!Q%^!Q![2S![!c%^!c!i2S!i#T%^#T#Z2S#Z;'S%^;'S;=`%o<%lO%^l2ZYf[o`Oy%^z!Q%^!Q![2y![!c%^!c!i2y!i#T%^#T#Z2y#Z;'S%^;'S;=`%o<%lO%^l3QYf[o`Oy%^z!Q%^!Q![3p![!c%^!c!i3p!i#T%^#T#Z3p#Z;'S%^;'S;=`%o<%lO%^l3uYo`Oy%^z!Q%^!Q![4e![!c%^!c!i4e!i#T%^#T#Z4e#Z;'S%^;'S;=`%o<%lO%^l4lYf[o`Oy%^z!Q%^!Q![5[![!c%^!c!i5[!i#T%^#T#Z5[#Z;'S%^;'S;=`%o<%lO%^l5aYo`Oy%^z!Q%^!Q![6P![!c%^!c!i6P!i#T%^#T#Z6P#Z;'S%^;'S;=`%o<%lO%^l6WSf[o`Oy%^z;'S%^;'S;=`%o<%lO%^d6gUOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^d7QS|So`Oy%^z;'S%^;'S;=`%o<%lO%^b7cSXQOy%^z;'S%^;'S;=`%o<%lO%^~7rWOY7oZw7owx.nx#O7o#O#P8[#P;'S7o;'S;=`9W<%lO7o~8_RO;'S7o;'S;=`8h;=`O7o~8kXOY7oZw7owx.nx#O7o#O#P8[#P;'S7o;'S;=`9W;=`<%l7o<%lO7o~9ZP;=`<%l7on9cSb^Oy%^z;'S%^;'S;=`%o<%lO%^~9tOa~n9{UUQjWOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^n:fWjW!RQOy%^z!O%^!O!P;O!P!Q%^!Q![>T![;'S%^;'S;=`%o<%lO%^l;TUo`Oy%^z!Q%^!Q![;g![;'S%^;'S;=`%o<%lO%^l;nYo`#e[Oy%^z!Q%^!Q![;g![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^l<cYo`Oy%^z{%^{|=R|}%^}!O=R!O!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l=WUo`Oy%^z!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l=qUo`#e[Oy%^z!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l>[[o`#e[Oy%^z!O%^!O!P;g!P!Q%^!Q![>T![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^n?VSt^Oy%^z;'S%^;'S;=`%o<%lO%^l?hWjWOy%^z!O%^!O!P;O!P!Q%^!Q![>T![;'S%^;'S;=`%o<%lO%^n@VU#bQOy%^z!Q%^!Q![;g![;'S%^;'S;=`%o<%lO%^~@nTjWOy%^z{@}{;'S%^;'S;=`%o<%lO%^~AUSo`#[~Oy%^z;'S%^;'S;=`%o<%lO%^lAg[#e[Oy%^z!O%^!O!P;g!P!Q%^!Q![>T![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^bBbU]QOy%^z![%^![!]Bt!];'S%^;'S;=`%o<%lO%^bB{S^Qo`Oy%^z;'S%^;'S;=`%o<%lO%^nC^S!Y^Oy%^z;'S%^;'S;=`%o<%lO%^dCoS|SOy%^z;'S%^;'S;=`%o<%lO%^bDQU!OQOy%^z!`%^!`!aDd!a;'S%^;'S;=`%o<%lO%^bDkS!OQo`Oy%^z;'S%^;'S;=`%o<%lO%^bDzWOy%^z!c%^!c!}Ed!}#T%^#T#oEd#o;'S%^;'S;=`%o<%lO%^bEk[![Qo`Oy%^z}%^}!OEd!O!Q%^!Q![Ed![!c%^!c!}Ed!}#T%^#T#oEd#o;'S%^;'S;=`%o<%lO%^nFfSq^Oy%^z;'S%^;'S;=`%o<%lO%^nFwSp^Oy%^z;'S%^;'S;=`%o<%lO%^bGWUOy%^z#b%^#b#cGj#c;'S%^;'S;=`%o<%lO%^bGoUo`Oy%^z#W%^#W#XHR#X;'S%^;'S;=`%o<%lO%^bHYS!bQo`Oy%^z;'S%^;'S;=`%o<%lO%^bHiUOy%^z#f%^#f#gHR#g;'S%^;'S;=`%o<%lO%^fIQS!TUOy%^z;'S%^;'S;=`%o<%lO%^nIcS!S^Oy%^z;'S%^;'S;=`%o<%lO%^fItU!RQOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^`JZP;=`<%l$}",
  tokenizers: [sm, om, nm, 1, 2, 3, 4, new $n("m~RRYZ[z{a~~g~aO#^~~dP!P!Qg~lO#_~~", 28, 105)],
  topRules: { StyleSheet: [0, 4], Styles: [1, 86] },
  specialized: [{ term: 100, get: (r) => am[r] || -1 }, { term: 58, get: (r) => hm[r] || -1 }, { term: 101, get: (r) => cm[r] || -1 }],
  tokenPrec: 1200
});
class L {
  /**
  Get the line description around the given position.
  */
  lineAt(e) {
    if (e < 0 || e > this.length)
      throw new RangeError(`Invalid position ${e} in document of length ${this.length}`);
    return this.lineInner(e, !1, 1, 0);
  }
  /**
  Get the description for the given (1-based) line number.
  */
  line(e) {
    if (e < 1 || e > this.lines)
      throw new RangeError(`Invalid line number ${e} in ${this.lines}-line document`);
    return this.lineInner(e, !0, 1, 0);
  }
  /**
  Replace a range of the text with the given content.
  */
  replace(e, t, i) {
    [e, t] = Si(this, e, t);
    let n = [];
    return this.decompose(
      0,
      e,
      n,
      2
      /* Open.To */
    ), i.length && i.decompose(
      0,
      i.length,
      n,
      3
      /* Open.To */
    ), this.decompose(
      t,
      this.length,
      n,
      1
      /* Open.From */
    ), st.from(n, this.length - (t - e) + i.length);
  }
  /**
  Append another document to this one.
  */
  append(e) {
    return this.replace(this.length, this.length, e);
  }
  /**
  Retrieve the text between the given points.
  */
  slice(e, t = this.length) {
    [e, t] = Si(this, e, t);
    let i = [];
    return this.decompose(e, t, i, 0), st.from(i, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), i = this.length - this.scanIdentical(e, -1), n = new Gi(this), s = new Gi(e);
    for (let o = t, l = t; ; ) {
      if (n.next(o), s.next(o), o = 0, n.lineBreak != s.lineBreak || n.done != s.done || n.value != s.value)
        return !1;
      if (l += n.value.length, n.done || l >= i)
        return !0;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(e = 1) {
    return new Gi(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new jc(this, e, t);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(e, t) {
    let i;
    if (e == null)
      i = this.iter();
    else {
      t == null && (t = this.lines + 1);
      let n = this.line(e).from;
      i = this.iterRange(n, Math.max(n, t == this.lines + 1 ? this.length : t <= 1 ? 0 : this.line(t - 1).to));
    }
    return new Gc(i);
  }
  /**
  Return the document as a string, using newline characters to
  separate lines.
  */
  toString() {
    return this.sliceString(0);
  }
  /**
  Convert the document to an array of lines (which can be
  deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
  */
  toJSON() {
    let e = [];
    return this.flatten(e), e;
  }
  /**
  @internal
  */
  constructor() {
  }
  /**
  Create a `Text` instance for the given array of lines.
  */
  static of(e) {
    if (e.length == 0)
      throw new RangeError("A document must have at least one line");
    return e.length == 1 && !e[0] ? L.empty : e.length <= 32 ? new ie(e) : st.from(ie.split(e, []));
  }
}
class ie extends L {
  constructor(e, t = um(e)) {
    super(), this.text = e, this.length = t;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(e, t, i, n) {
    for (let s = 0; ; s++) {
      let o = this.text[s], l = n + o.length;
      if ((t ? i : l) >= e)
        return new dm(n, l, i, o);
      n = l + 1, i++;
    }
  }
  decompose(e, t, i, n) {
    let s = e <= 0 && t >= this.length ? this : new ie(xa(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (n & 1) {
      let o = i.pop(), l = On(s.text, o.text.slice(), 0, s.length);
      if (l.length <= 32)
        i.push(new ie(l, o.length + s.length));
      else {
        let a = l.length >> 1;
        i.push(new ie(l.slice(0, a)), new ie(l.slice(a)));
      }
    } else
      i.push(s);
  }
  replace(e, t, i) {
    if (!(i instanceof ie))
      return super.replace(e, t, i);
    [e, t] = Si(this, e, t);
    let n = On(this.text, On(i.text, xa(this.text, 0, e)), t), s = this.length + i.length - (t - e);
    return n.length <= 32 ? new ie(n, s) : st.from(ie.split(n, []), s);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = Si(this, e, t);
    let n = "";
    for (let s = 0, o = 0; s <= t && o < this.text.length; o++) {
      let l = this.text[o], a = s + l.length;
      s > e && o && (n += i), e < a && t > s && (n += l.slice(Math.max(0, e - s), t - s)), s = a + 1;
    }
    return n;
  }
  flatten(e) {
    for (let t of this.text)
      e.push(t);
  }
  scanIdentical() {
    return 0;
  }
  static split(e, t) {
    let i = [], n = -1;
    for (let s of e)
      i.push(s), n += s.length + 1, i.length == 32 && (t.push(new ie(i, n)), i = [], n = -1);
    return n > -1 && t.push(new ie(i, n)), t;
  }
}
class st extends L {
  constructor(e, t) {
    super(), this.children = e, this.length = t, this.lines = 0;
    for (let i of e)
      this.lines += i.lines;
  }
  lineInner(e, t, i, n) {
    for (let s = 0; ; s++) {
      let o = this.children[s], l = n + o.length, a = i + o.lines - 1;
      if ((t ? a : l) >= e)
        return o.lineInner(e, t, i, n);
      n = l + 1, i = a + 1;
    }
  }
  decompose(e, t, i, n) {
    for (let s = 0, o = 0; o <= t && s < this.children.length; s++) {
      let l = this.children[s], a = o + l.length;
      if (e <= a && t >= o) {
        let h = n & ((o <= e ? 1 : 0) | (a >= t ? 2 : 0));
        o >= e && a <= t && !h ? i.push(l) : l.decompose(e - o, t - o, i, h);
      }
      o = a + 1;
    }
  }
  replace(e, t, i) {
    if ([e, t] = Si(this, e, t), i.lines < this.lines)
      for (let n = 0, s = 0; n < this.children.length; n++) {
        let o = this.children[n], l = s + o.length;
        if (e >= s && t <= l) {
          let a = o.replace(e - s, t - s, i), h = this.lines - o.lines + a.lines;
          if (a.lines < h >> 4 && a.lines > h >> 6) {
            let c = this.children.slice();
            return c[n] = a, new st(c, this.length - (t - e) + i.length);
          }
          return super.replace(s, l, a);
        }
        s = l + 1;
      }
    return super.replace(e, t, i);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = Si(this, e, t);
    let n = "";
    for (let s = 0, o = 0; s < this.children.length && o <= t; s++) {
      let l = this.children[s], a = o + l.length;
      o > e && s && (n += i), e < a && t > o && (n += l.sliceString(e - o, t - o, i)), o = a + 1;
    }
    return n;
  }
  flatten(e) {
    for (let t of this.children)
      t.flatten(e);
  }
  scanIdentical(e, t) {
    if (!(e instanceof st))
      return 0;
    let i = 0, [n, s, o, l] = t > 0 ? [0, 0, this.children.length, e.children.length] : [this.children.length - 1, e.children.length - 1, -1, -1];
    for (; ; n += t, s += t) {
      if (n == o || s == l)
        return i;
      let a = this.children[n], h = e.children[s];
      if (a != h)
        return i + a.scanIdentical(h, t);
      i += a.length + 1;
    }
  }
  static from(e, t = e.reduce((i, n) => i + n.length + 1, -1)) {
    let i = 0;
    for (let O of e)
      i += O.lines;
    if (i < 32) {
      let O = [];
      for (let p of e)
        p.flatten(O);
      return new ie(O, t);
    }
    let n = Math.max(
      32,
      i >> 5
      /* Tree.BranchShift */
    ), s = n << 1, o = n >> 1, l = [], a = 0, h = -1, c = [];
    function f(O) {
      let p;
      if (O.lines > s && O instanceof st)
        for (let m of O.children)
          f(m);
      else O.lines > o && (a > o || !a) ? (d(), l.push(O)) : O instanceof ie && a && (p = c[c.length - 1]) instanceof ie && O.lines + p.lines <= 32 ? (a += O.lines, h += O.length + 1, c[c.length - 1] = new ie(p.text.concat(O.text), p.length + 1 + O.length)) : (a + O.lines > n && d(), a += O.lines, h += O.length + 1, c.push(O));
    }
    function d() {
      a != 0 && (l.push(c.length == 1 ? c[0] : st.from(c, h)), h = -1, a = c.length = 0);
    }
    for (let O of e)
      f(O);
    return d(), l.length == 1 ? l[0] : new st(l, t);
  }
}
L.empty = /* @__PURE__ */ new ie([""], 0);
function um(r) {
  let e = -1;
  for (let t of r)
    e += t.length + 1;
  return e;
}
function On(r, e, t = 0, i = 1e9) {
  for (let n = 0, s = 0, o = !0; s < r.length && n <= i; s++) {
    let l = r[s], a = n + l.length;
    a >= t && (a > i && (l = l.slice(0, i - n)), n < t && (l = l.slice(t - n)), o ? (e[e.length - 1] += l, o = !1) : e.push(l)), n = a + 1;
  }
  return e;
}
function xa(r, e, t) {
  return On(r, [""], e, t);
}
class Gi {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof ie ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let i = this.nodes.length - 1, n = this.nodes[i], s = this.offsets[i], o = s >> 1, l = n instanceof ie ? n.text.length : n.children.length;
      if (o == (t > 0 ? l : 0)) {
        if (i == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((s & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[i] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (n instanceof ie) {
        let a = n.text[o + (t < 0 ? -1 : 0)];
        if (this.offsets[i] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = n.children[o + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[i] += t) : (t < 0 && this.offsets[i]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof ie ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class jc {
  constructor(e, t, i) {
    this.value = "", this.done = !1, this.cursor = new Gi(e, t > i ? -1 : 1), this.pos = t > i ? e.length : 0, this.from = Math.min(t, i), this.to = Math.max(t, i);
  }
  nextInner(e, t) {
    if (t < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    e += Math.max(0, t < 0 ? this.pos - this.to : this.from - this.pos);
    let i = t < 0 ? this.pos - this.from : this.to - this.pos;
    e > i && (e = i), i -= e;
    let { value: n } = this.cursor.next(e);
    return this.pos += (n.length + e) * t, this.value = n.length <= i ? n : t < 0 ? n.slice(n.length - i) : n.slice(0, i), this.done = !this.value, this;
  }
  next(e = 0) {
    return e < 0 ? e = Math.max(e, this.from - this.pos) : e > 0 && (e = Math.min(e, this.to - this.pos)), this.nextInner(e, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class Gc {
  constructor(e) {
    this.inner = e, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(e = 0) {
    let { done: t, lineBreak: i, value: n } = this.inner.next(e);
    return t && this.afterBreak ? (this.value = "", this.afterBreak = !1) : t ? (this.done = !0, this.value = "") : i ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = n, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (L.prototype[Symbol.iterator] = function() {
  return this.iter();
}, Gi.prototype[Symbol.iterator] = jc.prototype[Symbol.iterator] = Gc.prototype[Symbol.iterator] = function() {
  return this;
});
let dm = class {
  /**
  @internal
  */
  constructor(e, t, i, n) {
    this.from = e, this.to = t, this.number = i, this.text = n;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
};
function Si(r, e, t) {
  return e = Math.max(0, Math.min(r.length, e)), [e, Math.max(e, Math.min(r.length, t))];
}
let ui = /* @__PURE__ */ "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((r) => r ? parseInt(r, 36) : 1);
for (let r = 1; r < ui.length; r++)
  ui[r] += ui[r - 1];
function Om(r) {
  for (let e = 1; e < ui.length; e += 2)
    if (ui[e] > r)
      return ui[e - 1] <= r;
  return !1;
}
function ka(r) {
  return r >= 127462 && r <= 127487;
}
const Qa = 8205;
function pe(r, e, t = !0, i = !0) {
  return (t ? Fc : pm)(r, e, i);
}
function Fc(r, e, t) {
  if (e == r.length)
    return e;
  e && Hc(r.charCodeAt(e)) && Kc(r.charCodeAt(e - 1)) && e--;
  let i = fe(r, e);
  for (e += Ve(i); e < r.length; ) {
    let n = fe(r, e);
    if (i == Qa || n == Qa || t && Om(n))
      e += Ve(n), i = n;
    else if (ka(n)) {
      let s = 0, o = e - 2;
      for (; o >= 0 && ka(fe(r, o)); )
        s++, o -= 2;
      if (s % 2 == 0)
        break;
      e += 2;
    } else
      break;
  }
  return e;
}
function pm(r, e, t) {
  for (; e > 0; ) {
    let i = Fc(r, e - 2, t);
    if (i < e)
      return i;
    e--;
  }
  return 0;
}
function Hc(r) {
  return r >= 56320 && r < 57344;
}
function Kc(r) {
  return r >= 55296 && r < 56320;
}
function fe(r, e) {
  let t = r.charCodeAt(e);
  if (!Kc(t) || e + 1 == r.length)
    return t;
  let i = r.charCodeAt(e + 1);
  return Hc(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function sl(r) {
  return r <= 65535 ? String.fromCharCode(r) : (r -= 65536, String.fromCharCode((r >> 10) + 55296, (r & 1023) + 56320));
}
function Ve(r) {
  return r < 65536 ? 1 : 2;
}
const Ks = /\r\n?|\n/;
var de = /* @__PURE__ */ function(r) {
  return r[r.Simple = 0] = "Simple", r[r.TrackDel = 1] = "TrackDel", r[r.TrackBefore = 2] = "TrackBefore", r[r.TrackAfter = 3] = "TrackAfter", r;
}(de || (de = {}));
class ct {
  // Sections are encoded as pairs of integers. The first is the
  // length in the current document, and the second is -1 for
  // unaffected sections, and the length of the replacement content
  // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
  // 0), and a replacement two positive numbers.
  /**
  @internal
  */
  constructor(e) {
    this.sections = e;
  }
  /**
  The length of the document before the change.
  */
  get length() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2)
      e += this.sections[t];
    return e;
  }
  /**
  The length of the document after the change.
  */
  get newLength() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2) {
      let i = this.sections[t + 1];
      e += i < 0 ? this.sections[t] : i;
    }
    return e;
  }
  /**
  False when there are actual changes in this set.
  */
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  /**
  Iterate over the unchanged parts left by these changes. `posA`
  provides the position of the range in the old document, `posB`
  the new position in the changed document.
  */
  iterGaps(e) {
    for (let t = 0, i = 0, n = 0; t < this.sections.length; ) {
      let s = this.sections[t++], o = this.sections[t++];
      o < 0 ? (e(i, n, s), n += s) : n += o, i += s;
    }
  }
  /**
  Iterate over the ranges changed by these changes. (See
  [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
  variant that also provides you with the inserted text.)
  `fromA`/`toA` provides the extent of the change in the starting
  document, `fromB`/`toB` the extent of the replacement in the
  changed document.
  
  When `individual` is true, adjacent changes (which are kept
  separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
  reported separately.
  */
  iterChangedRanges(e, t = !1) {
    Js(this, e, t);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let e = [];
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], n = this.sections[t++];
      n < 0 ? e.push(i, n) : e.push(n, i);
    }
    return new ct(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : Jc(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `other` happened before the ones in `this`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : eo(this, e, t);
  }
  mapPos(e, t = -1, i = de.Simple) {
    let n = 0, s = 0;
    for (let o = 0; o < this.sections.length; ) {
      let l = this.sections[o++], a = this.sections[o++], h = n + l;
      if (a < 0) {
        if (h > e)
          return s + (e - n);
        s += l;
      } else {
        if (i != de.Simple && h >= e && (i == de.TrackDel && n < e && h > e || i == de.TrackBefore && n < e || i == de.TrackAfter && h > e))
          return null;
        if (h > e || h == e && t < 0 && !l)
          return e == n || t < 0 ? s : s + a;
        s += a;
      }
      n = h;
    }
    if (e > n)
      throw new RangeError(`Position ${e} is out of range for changeset of length ${n}`);
    return s;
  }
  /**
  Check whether these changes touch a given range. When one of the
  changes entirely covers the range, the string `"cover"` is
  returned.
  */
  touchesRange(e, t = e) {
    for (let i = 0, n = 0; i < this.sections.length && n <= t; ) {
      let s = this.sections[i++], o = this.sections[i++], l = n + s;
      if (o >= 0 && n <= t && l >= e)
        return n < e && l > t ? "cover" : !0;
      n = l;
    }
    return !1;
  }
  /**
  @internal
  */
  toString() {
    let e = "";
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], n = this.sections[t++];
      e += (e ? " " : "") + i + (n >= 0 ? ":" + n : "");
    }
    return e;
  }
  /**
  Serialize this change desc to a JSON-representable value.
  */
  toJSON() {
    return this.sections;
  }
  /**
  Create a change desc from its JSON representation (as produced
  by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e) || e.length % 2 || e.some((t) => typeof t != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new ct(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new ct(e);
  }
}
class le extends ct {
  constructor(e, t) {
    super(e), this.inserted = t;
  }
  /**
  Apply the changes to a document, returning the modified
  document.
  */
  apply(e) {
    if (this.length != e.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    return Js(this, (t, i, n, s, o) => e = e.replace(n, n + (i - t), o), !1), e;
  }
  mapDesc(e, t = !1) {
    return eo(this, e, t, !0);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(e) {
    let t = this.sections.slice(), i = [];
    for (let n = 0, s = 0; n < t.length; n += 2) {
      let o = t[n], l = t[n + 1];
      if (l >= 0) {
        t[n] = l, t[n + 1] = o;
        let a = n >> 1;
        for (; i.length < a; )
          i.push(L.empty);
        i.push(o ? e.slice(s, s + o) : L.empty);
      }
      s += o;
    }
    return new le(t, i);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : Jc(this, e, !0);
  }
  /**
  Given another change set starting in the same document, maps this
  change set over the other, producing a new change set that can be
  applied to the document produced by applying `other`. When
  `before` is `true`, order changes as if `this` comes before
  `other`, otherwise (the default) treat `other` as coming first.
  
  Given two changes `A` and `B`, `A.compose(B.map(A))` and
  `B.compose(A.map(B, true))` will produce the same document. This
  provides a basic form of [operational
  transformation](https://en.wikipedia.org/wiki/Operational_transformation),
  and can be used for collaborative editing.
  */
  map(e, t = !1) {
    return e.empty ? this : eo(this, e, t, !0);
  }
  /**
  Iterate over the changed ranges in the document, calling `f` for
  each, with the range in the original document (`fromA`-`toA`)
  and the range that replaces it in the new document
  (`fromB`-`toB`).
  
  When `individual` is true, adjacent changes are reported
  separately.
  */
  iterChanges(e, t = !1) {
    Js(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return ct.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], i = [], n = [], s = new sr(this);
    e: for (let o = 0, l = 0; ; ) {
      let a = o == e.length ? 1e9 : e[o++];
      for (; l < a || l == a && s.len == 0; ) {
        if (s.done)
          break e;
        let c = Math.min(s.len, a - l);
        me(n, c, -1);
        let f = s.ins == -1 ? -1 : s.off == 0 ? s.ins : 0;
        me(t, c, f), f > 0 && Zt(i, t, s.text), s.forward(c), l += c;
      }
      let h = e[o++];
      for (; l < h; ) {
        if (s.done)
          break e;
        let c = Math.min(s.len, h - l);
        me(t, c, -1), me(n, c, s.ins == -1 ? -1 : s.off == 0 ? s.ins : 0), s.forward(c), l += c;
      }
    }
    return {
      changes: new le(t, i),
      filtered: ct.create(n)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let e = [];
    for (let t = 0; t < this.sections.length; t += 2) {
      let i = this.sections[t], n = this.sections[t + 1];
      n < 0 ? e.push(i) : n == 0 ? e.push([i]) : e.push([i].concat(this.inserted[t >> 1].toJSON()));
    }
    return e;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(e, t, i) {
    let n = [], s = [], o = 0, l = null;
    function a(c = !1) {
      if (!c && !n.length)
        return;
      o < t && me(n, t - o, -1);
      let f = new le(n, s);
      l = l ? l.compose(f.map(l)) : f, n = [], s = [], o = 0;
    }
    function h(c) {
      if (Array.isArray(c))
        for (let f of c)
          h(f);
      else if (c instanceof le) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        a(), l = l ? l.compose(c.map(l)) : c;
      } else {
        let { from: f, to: d = f, insert: O } = c;
        if (f > d || f < 0 || d > t)
          throw new RangeError(`Invalid change range ${f} to ${d} (in doc of length ${t})`);
        let p = O ? typeof O == "string" ? L.of(O.split(i || Ks)) : O : L.empty, m = p.length;
        if (f == d && m == 0)
          return;
        f < o && a(), f > o && me(n, f - o, -1), me(n, d - f, m), Zt(s, n, p), o = d;
      }
    }
    return h(e), a(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new le(e ? [e, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let t = [], i = [];
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      if (typeof s == "number")
        t.push(s, -1);
      else {
        if (!Array.isArray(s) || typeof s[0] != "number" || s.some((o, l) => l && typeof o != "string"))
          throw new RangeError("Invalid JSON representation of ChangeSet");
        if (s.length == 1)
          t.push(s[0], 0);
        else {
          for (; i.length < n; )
            i.push(L.empty);
          i[n] = L.of(s.slice(1)), t.push(s[0], i[n].length);
        }
      }
    }
    return new le(t, i);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new le(e, t);
  }
}
function me(r, e, t, i = !1) {
  if (e == 0 && t <= 0)
    return;
  let n = r.length - 2;
  n >= 0 && t <= 0 && t == r[n + 1] ? r[n] += e : e == 0 && r[n] == 0 ? r[n + 1] += t : i ? (r[n] += e, r[n + 1] += t) : r.push(e, t);
}
function Zt(r, e, t) {
  if (t.length == 0)
    return;
  let i = e.length - 2 >> 1;
  if (i < r.length)
    r[r.length - 1] = r[r.length - 1].append(t);
  else {
    for (; r.length < i; )
      r.push(L.empty);
    r.push(t);
  }
}
function Js(r, e, t) {
  let i = r.inserted;
  for (let n = 0, s = 0, o = 0; o < r.sections.length; ) {
    let l = r.sections[o++], a = r.sections[o++];
    if (a < 0)
      n += l, s += l;
    else {
      let h = n, c = s, f = L.empty;
      for (; h += l, c += a, a && i && (f = f.append(i[o - 2 >> 1])), !(t || o == r.sections.length || r.sections[o + 1] < 0); )
        l = r.sections[o++], a = r.sections[o++];
      e(n, h, s, c, f), n = h, s = c;
    }
  }
}
function eo(r, e, t, i = !1) {
  let n = [], s = i ? [] : null, o = new sr(r), l = new sr(e);
  for (let a = -1; ; )
    if (o.ins == -1 && l.ins == -1) {
      let h = Math.min(o.len, l.len);
      me(n, h, -1), o.forward(h), l.forward(h);
    } else if (l.ins >= 0 && (o.ins < 0 || a == o.i || o.off == 0 && (l.len < o.len || l.len == o.len && !t))) {
      let h = l.len;
      for (me(n, l.ins, -1); h; ) {
        let c = Math.min(o.len, h);
        o.ins >= 0 && a < o.i && o.len <= c && (me(n, 0, o.ins), s && Zt(s, n, o.text), a = o.i), o.forward(c), h -= c;
      }
      l.next();
    } else if (o.ins >= 0) {
      let h = 0, c = o.len;
      for (; c; )
        if (l.ins == -1) {
          let f = Math.min(c, l.len);
          h += f, c -= f, l.forward(f);
        } else if (l.ins == 0 && l.len < c)
          c -= l.len, l.next();
        else
          break;
      me(n, h, a < o.i ? o.ins : 0), s && a < o.i && Zt(s, n, o.text), a = o.i, o.forward(o.len - c);
    } else {
      if (o.done && l.done)
        return s ? le.createSet(n, s) : ct.create(n);
      throw new Error("Mismatched change set lengths");
    }
}
function Jc(r, e, t = !1) {
  let i = [], n = t ? [] : null, s = new sr(r), o = new sr(e);
  for (let l = !1; ; ) {
    if (s.done && o.done)
      return n ? le.createSet(i, n) : ct.create(i);
    if (s.ins == 0)
      me(i, s.len, 0, l), s.next();
    else if (o.len == 0 && !o.done)
      me(i, 0, o.ins, l), n && Zt(n, i, o.text), o.next();
    else {
      if (s.done || o.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(s.len2, o.len), h = i.length;
        if (s.ins == -1) {
          let c = o.ins == -1 ? -1 : o.off ? 0 : o.ins;
          me(i, a, c, l), n && c && Zt(n, i, o.text);
        } else o.ins == -1 ? (me(i, s.off ? 0 : s.len, a, l), n && Zt(n, i, s.textBit(a))) : (me(i, s.off ? 0 : s.len, o.off ? 0 : o.ins, l), n && !o.off && Zt(n, i, o.text));
        l = (s.ins > a || o.ins >= 0 && o.len > a) && (l || i.length > h), s.forward2(a), o.forward(a);
      }
    }
  }
}
class sr {
  constructor(e) {
    this.set = e, this.i = 0, this.next();
  }
  next() {
    let { sections: e } = this.set;
    this.i < e.length ? (this.len = e[this.i++], this.ins = e[this.i++]) : (this.len = 0, this.ins = -2), this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted: e } = this.set, t = this.i - 2 >> 1;
    return t >= e.length ? L.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, i = this.i - 2 >> 1;
    return i >= t.length && !e ? L.empty : t[i].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class _t {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.flags = i;
  }
  /**
  The anchor of the range—the side that doesn't move when you
  extend it.
  */
  get anchor() {
    return this.flags & 32 ? this.to : this.from;
  }
  /**
  The head of the range, which is moved when the range is
  [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
  */
  get head() {
    return this.flags & 32 ? this.from : this.to;
  }
  /**
  True when `anchor` and `head` are at the same position.
  */
  get empty() {
    return this.from == this.to;
  }
  /**
  If this is a cursor that is explicitly associated with the
  character on one of its sides, this returns the side. -1 means
  the character before its position, 1 the character after, and 0
  means no association.
  */
  get assoc() {
    return this.flags & 8 ? -1 : this.flags & 16 ? 1 : 0;
  }
  /**
  The bidirectional text level associated with this cursor, if
  any.
  */
  get bidiLevel() {
    let e = this.flags & 7;
    return e == 7 ? null : e;
  }
  /**
  The goal column (stored vertical offset) associated with a
  cursor. This is used to preserve the vertical position when
  [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
  lines of different length.
  */
  get goalColumn() {
    let e = this.flags >> 6;
    return e == 16777215 ? void 0 : e;
  }
  /**
  Map this range through a change, producing a valid range in the
  updated document.
  */
  map(e, t = -1) {
    let i, n;
    return this.empty ? i = n = e.mapPos(this.from, t) : (i = e.mapPos(this.from, 1), n = e.mapPos(this.to, -1)), i == this.from && n == this.to ? this : new _t(i, n, this.flags);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(e, t = e) {
    if (e <= this.anchor && t >= this.anchor)
      return y.range(e, t);
    let i = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return y.range(this.anchor, i);
  }
  /**
  Compare this range to another range.
  */
  eq(e, t = !1) {
    return this.anchor == e.anchor && this.head == e.head && (!t || !this.empty || this.assoc == e.assoc);
  }
  /**
  Return a JSON-serializable object representing the range.
  */
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  /**
  Convert a JSON representation of a range to a `SelectionRange`
  instance.
  */
  static fromJSON(e) {
    if (!e || typeof e.anchor != "number" || typeof e.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return y.range(e.anchor, e.head);
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new _t(e, t, i);
  }
}
class y {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(e, t = -1) {
    return e.empty ? this : y.create(this.ranges.map((i) => i.map(e, t)), this.mainIndex);
  }
  /**
  Compare this selection to another selection. By default, ranges
  are compared only by position. When `includeAssoc` is true,
  cursor ranges must also have the same
  [`assoc`](https://codemirror.net/6/docs/ref/#state.SelectionRange.assoc) value.
  */
  eq(e, t = !1) {
    if (this.ranges.length != e.ranges.length || this.mainIndex != e.mainIndex)
      return !1;
    for (let i = 0; i < this.ranges.length; i++)
      if (!this.ranges[i].eq(e.ranges[i], t))
        return !1;
    return !0;
  }
  /**
  Get the primary selection range. Usually, you should make sure
  your code applies to _all_ ranges, by using methods like
  [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
  */
  get main() {
    return this.ranges[this.mainIndex];
  }
  /**
  Make sure the selection only has one range. Returns a selection
  holding only the main range from this selection.
  */
  asSingle() {
    return this.ranges.length == 1 ? this : new y([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(e, t = !0) {
    return y.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(e, t = this.mainIndex) {
    let i = this.ranges.slice();
    return i[t] = e, y.create(i, this.mainIndex);
  }
  /**
  Convert this selection to an object that can be serialized to
  JSON.
  */
  toJSON() {
    return { ranges: this.ranges.map((e) => e.toJSON()), main: this.mainIndex };
  }
  /**
  Create a selection from a JSON representation.
  */
  static fromJSON(e) {
    if (!e || !Array.isArray(e.ranges) || typeof e.main != "number" || e.main >= e.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new y(e.ranges.map((t) => _t.fromJSON(t)), e.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(e, t = e) {
    return new y([y.range(e, t)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(e, t = 0) {
    if (e.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let i = 0, n = 0; n < e.length; n++) {
      let s = e[n];
      if (s.empty ? s.from <= i : s.from < i)
        return y.normalized(e.slice(), t);
      i = s.to;
    }
    return new y(e, t);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(e, t = 0, i, n) {
    return _t.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (i == null ? 7 : Math.min(6, i)) | (n ?? 16777215) << 6);
  }
  /**
  Create a selection range.
  */
  static range(e, t, i, n) {
    let s = (i ?? 16777215) << 6 | (n == null ? 7 : Math.min(6, n));
    return t < e ? _t.create(t, e, 48 | s) : _t.create(e, t, (t > e ? 8 : 0) | s);
  }
  /**
  @internal
  */
  static normalized(e, t = 0) {
    let i = e[t];
    e.sort((n, s) => n.from - s.from), t = e.indexOf(i);
    for (let n = 1; n < e.length; n++) {
      let s = e[n], o = e[n - 1];
      if (s.empty ? s.from <= o.to : s.from < o.to) {
        let l = o.from, a = Math.max(s.to, o.to);
        n <= t && t--, e.splice(--n, 2, s.anchor > s.head ? y.range(a, l) : y.range(l, a));
      }
    }
    return new y(e, t);
  }
}
function ef(r, e) {
  for (let t of r.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let ol = 0;
class T {
  constructor(e, t, i, n, s) {
    this.combine = e, this.compareInput = t, this.compare = i, this.isStatic = n, this.id = ol++, this.default = e([]), this.extensions = typeof s == "function" ? s(this) : s;
  }
  /**
  Returns a facet reader for this facet, which can be used to
  [read](https://codemirror.net/6/docs/ref/#state.EditorState.facet) it but not to define values for it.
  */
  get reader() {
    return this;
  }
  /**
  Define a new facet.
  */
  static define(e = {}) {
    return new T(e.combine || ((t) => t), e.compareInput || ((t, i) => t === i), e.compare || (e.combine ? (t, i) => t === i : ll), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new pn([], this, 0, e);
  }
  /**
  Create an extension that computes a value for the facet from a
  state. You must take care to declare the parts of the state that
  this value depends on, since your function is only called again
  for a new state when one of those parts changed.
  
  In cases where your value depends only on a single field, you'll
  want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
  */
  compute(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new pn(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new pn(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (i) => i), this.compute([e], (i) => t(i.field(e)));
  }
}
function ll(r, e) {
  return r == e || r.length == e.length && r.every((t, i) => t === e[i]);
}
class pn {
  constructor(e, t, i, n) {
    this.dependencies = e, this.facet = t, this.type = i, this.value = n, this.id = ol++;
  }
  dynamicSlot(e) {
    var t;
    let i = this.value, n = this.facet.compareInput, s = this.id, o = e[s] >> 1, l = this.type == 2, a = !1, h = !1, c = [];
    for (let f of this.dependencies)
      f == "doc" ? a = !0 : f == "selection" ? h = !0 : ((t = e[f.id]) !== null && t !== void 0 ? t : 1) & 1 || c.push(e[f.id]);
    return {
      create(f) {
        return f.values[o] = i(f), 1;
      },
      update(f, d) {
        if (a && d.docChanged || h && (d.docChanged || d.selection) || to(f, c)) {
          let O = i(f);
          if (l ? !wa(O, f.values[o], n) : !n(O, f.values[o]))
            return f.values[o] = O, 1;
        }
        return 0;
      },
      reconfigure: (f, d) => {
        let O, p = d.config.address[s];
        if (p != null) {
          let m = Rn(d, p);
          if (this.dependencies.every((g) => g instanceof T ? d.facet(g) === f.facet(g) : g instanceof he ? d.field(g, !1) == f.field(g, !1) : !0) || (l ? wa(O = i(f), m, n) : n(O = i(f), m)))
            return f.values[o] = m, 0;
        } else
          O = i(f);
        return f.values[o] = O, 1;
      }
    };
  }
}
function wa(r, e, t) {
  if (r.length != e.length)
    return !1;
  for (let i = 0; i < r.length; i++)
    if (!t(r[i], e[i]))
      return !1;
  return !0;
}
function to(r, e) {
  let t = !1;
  for (let i of e)
    Fi(r, i) & 1 && (t = !0);
  return t;
}
function mm(r, e, t) {
  let i = t.map((a) => r[a.id]), n = t.map((a) => a.type), s = i.filter((a) => !(a & 1)), o = r[e.id] >> 1;
  function l(a) {
    let h = [];
    for (let c = 0; c < i.length; c++) {
      let f = Rn(a, i[c]);
      if (n[c] == 2)
        for (let d of f)
          h.push(d);
      else
        h.push(f);
    }
    return e.combine(h);
  }
  return {
    create(a) {
      for (let h of i)
        Fi(a, h);
      return a.values[o] = l(a), 1;
    },
    update(a, h) {
      if (!to(a, s))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[o]) ? 0 : (a.values[o] = c, 1);
    },
    reconfigure(a, h) {
      let c = to(a, i), f = h.config.facets[e.id], d = h.facet(e);
      if (f && !c && ll(t, f))
        return a.values[o] = d, 0;
      let O = l(a);
      return e.compare(O, d) ? (a.values[o] = d, 0) : (a.values[o] = O, 1);
    }
  };
}
const Pa = /* @__PURE__ */ T.define({ static: !0 });
class he {
  constructor(e, t, i, n, s) {
    this.id = e, this.createF = t, this.updateF = i, this.compareF = n, this.spec = s, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new he(ol++, e.create, e.update, e.compare || ((i, n) => i === n), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(Pa).find((i) => i.field == this);
    return ((t == null ? void 0 : t.create) || this.createF)(e);
  }
  /**
  @internal
  */
  slot(e) {
    let t = e[this.id] >> 1;
    return {
      create: (i) => (i.values[t] = this.create(i), 1),
      update: (i, n) => {
        let s = i.values[t], o = this.updateF(s, n);
        return this.compareF(s, o) ? 0 : (i.values[t] = o, 1);
      },
      reconfigure: (i, n) => n.config.address[this.id] != null ? (i.values[t] = n.field(this), 0) : (i.values[t] = this.create(i), 1)
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(e) {
    return [this, Pa.of({ field: this, create: e })];
  }
  /**
  State field instances can be used as
  [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
  given state.
  */
  get extension() {
    return this;
  }
}
const Lt = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function Ei(r) {
  return (e) => new tf(e, r);
}
const xt = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ Ei(Lt.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ Ei(Lt.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ Ei(Lt.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ Ei(Lt.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ Ei(Lt.lowest)
};
class tf {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
}
class vr {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new io(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return vr.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class io {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
}
class An {
  constructor(e, t, i, n, s, o) {
    for (this.base = e, this.compartments = t, this.dynamicSlots = i, this.address = n, this.staticValues = s, this.facets = o, this.statusTemplate = []; this.statusTemplate.length < i.length; )
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(e) {
    let t = this.address[e.id];
    return t == null ? e.default : this.staticValues[t >> 1];
  }
  static resolve(e, t, i) {
    let n = [], s = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Map();
    for (let d of gm(e, t, o))
      d instanceof he ? n.push(d) : (s[d.facet.id] || (s[d.facet.id] = [])).push(d);
    let l = /* @__PURE__ */ Object.create(null), a = [], h = [];
    for (let d of n)
      l[d.id] = h.length << 1, h.push((O) => d.slot(O));
    let c = i == null ? void 0 : i.config.facets;
    for (let d in s) {
      let O = s[d], p = O[0].facet, m = c && c[d] || [];
      if (O.every(
        (g) => g.type == 0
        /* Provider.Static */
      ))
        if (l[p.id] = a.length << 1 | 1, ll(m, O))
          a.push(i.facet(p));
        else {
          let g = p.combine(O.map((b) => b.value));
          a.push(i && p.compare(g, i.facet(p)) ? i.facet(p) : g);
        }
      else {
        for (let g of O)
          g.type == 0 ? (l[g.id] = a.length << 1 | 1, a.push(g.value)) : (l[g.id] = h.length << 1, h.push((b) => g.dynamicSlot(b)));
        l[p.id] = h.length << 1, h.push((g) => mm(g, p, O));
      }
    }
    let f = h.map((d) => d(l));
    return new An(e, o, f, l, a, s);
  }
}
function gm(r, e, t) {
  let i = [[], [], [], [], []], n = /* @__PURE__ */ new Map();
  function s(o, l) {
    let a = n.get(o);
    if (a != null) {
      if (a <= l)
        return;
      let h = i[a].indexOf(o);
      h > -1 && i[a].splice(h, 1), o instanceof io && t.delete(o.compartment);
    }
    if (n.set(o, l), Array.isArray(o))
      for (let h of o)
        s(h, l);
    else if (o instanceof io) {
      if (t.has(o.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let h = e.get(o.compartment) || o.inner;
      t.set(o.compartment, h), s(h, l);
    } else if (o instanceof tf)
      s(o.inner, o.prec);
    else if (o instanceof he)
      i[l].push(o), o.provides && s(o.provides, l);
    else if (o instanceof pn)
      i[l].push(o), o.facet.extensions && s(o.facet.extensions, Lt.default);
    else {
      let h = o.extension;
      if (!h)
        throw new Error(`Unrecognized extension value in extension set (${o}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      s(h, l);
    }
  }
  return s(r, Lt.default), i.reduce((o, l) => o.concat(l));
}
function Fi(r, e) {
  if (e & 1)
    return 2;
  let t = e >> 1, i = r.status[t];
  if (i == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (i & 2)
    return i;
  r.status[t] = 4;
  let n = r.computeSlot(r, r.config.dynamicSlots[t]);
  return r.status[t] = 2 | n;
}
function Rn(r, e) {
  return e & 1 ? r.config.staticValues[e >> 1] : r.values[e >> 1];
}
const rf = /* @__PURE__ */ T.define(), ro = /* @__PURE__ */ T.define({
  combine: (r) => r.some((e) => e),
  static: !0
}), nf = /* @__PURE__ */ T.define({
  combine: (r) => r.length ? r[0] : void 0,
  static: !0
}), sf = /* @__PURE__ */ T.define(), of = /* @__PURE__ */ T.define(), lf = /* @__PURE__ */ T.define(), af = /* @__PURE__ */ T.define({
  combine: (r) => r.length ? r[0] : !1
});
class kt {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Define a new type of annotation.
  */
  static define() {
    return new bm();
  }
}
class bm {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new kt(this, e);
  }
}
class Sm {
  /**
  @internal
  */
  constructor(e) {
    this.map = e;
  }
  /**
  Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
  type.
  */
  of(e) {
    return new M(this, e);
  }
}
class M {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Map this effect through a position mapping. Will return
  `undefined` when that ends up deleting the effect.
  */
  map(e) {
    let t = this.type.map(this.value, e);
    return t === void 0 ? void 0 : t == this.value ? this : new M(this.type, t);
  }
  /**
  Tells you whether this effect object is of a given
  [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
  */
  is(e) {
    return this.type == e;
  }
  /**
  Define a new effect type. The type parameter indicates the type
  of values that his effect holds. It should be a type that
  doesn't include `undefined`, since that is used in
  [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
  removed.
  */
  static define(e = {}) {
    return new Sm(e.map || ((t) => t));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(e, t) {
    if (!e.length)
      return e;
    let i = [];
    for (let n of e) {
      let s = n.map(t);
      s && i.push(s);
    }
    return i;
  }
}
M.reconfigure = /* @__PURE__ */ M.define();
M.appendConfig = /* @__PURE__ */ M.define();
class ne {
  constructor(e, t, i, n, s, o) {
    this.startState = e, this.changes = t, this.selection = i, this.effects = n, this.annotations = s, this.scrollIntoView = o, this._doc = null, this._state = null, i && ef(i, t.newLength), s.some((l) => l.type == ne.time) || (this.annotations = s.concat(ne.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, i, n, s, o) {
    return new ne(e, t, i, n, s, o);
  }
  /**
  The new document produced by the transaction. Contrary to
  [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
  force the entire new state to be computed right away, so it is
  recommended that [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
  when they need to look at the new document.
  */
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  /**
  The new selection produced by the transaction. If
  [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
  this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
  current selection through the changes made by the transaction.
  */
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  /**
  The new state created by the transaction. Computed on demand
  (but retained for subsequent access), so it is recommended not to
  access it in [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
  */
  get state() {
    return this._state || this.startState.applyTransaction(this), this._state;
  }
  /**
  Get the value of the given annotation type, if any.
  */
  annotation(e) {
    for (let t of this.annotations)
      if (t.type == e)
        return t.value;
  }
  /**
  Indicates whether the transaction changed the document.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Indicates whether this transaction reconfigures the state
  (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
  with a top-level configuration
  [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
  */
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  /**
  Returns true if the transaction has a [user
  event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
  or more specific than `event`. For example, if the transaction
  has `"select.pointer"` as user event, `"select"` and
  `"select.pointer"` will match it.
  */
  isUserEvent(e) {
    let t = this.annotation(ne.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
ne.time = /* @__PURE__ */ kt.define();
ne.userEvent = /* @__PURE__ */ kt.define();
ne.addToHistory = /* @__PURE__ */ kt.define();
ne.remote = /* @__PURE__ */ kt.define();
function ym(r, e) {
  let t = [];
  for (let i = 0, n = 0; ; ) {
    let s, o;
    if (i < r.length && (n == e.length || e[n] >= r[i]))
      s = r[i++], o = r[i++];
    else if (n < e.length)
      s = e[n++], o = e[n++];
    else
      return t;
    !t.length || t[t.length - 1] < s ? t.push(s, o) : t[t.length - 1] < o && (t[t.length - 1] = o);
  }
}
function hf(r, e, t) {
  var i;
  let n, s, o;
  return t ? (n = e.changes, s = le.empty(e.changes.length), o = r.changes.compose(e.changes)) : (n = e.changes.map(r.changes), s = r.changes.mapDesc(e.changes, !0), o = r.changes.compose(n)), {
    changes: o,
    selection: e.selection ? e.selection.map(s) : (i = r.selection) === null || i === void 0 ? void 0 : i.map(n),
    effects: M.mapEffects(r.effects, n).concat(M.mapEffects(e.effects, s)),
    annotations: r.annotations.length ? r.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: r.scrollIntoView || e.scrollIntoView
  };
}
function no(r, e, t) {
  let i = e.selection, n = di(e.annotations);
  return e.userEvent && (n = n.concat(ne.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof le ? e.changes : le.of(e.changes || [], t, r.facet(nf)),
    selection: i && (i instanceof y ? i : y.single(i.anchor, i.head)),
    effects: di(e.effects),
    annotations: n,
    scrollIntoView: !!e.scrollIntoView
  };
}
function cf(r, e, t) {
  let i = no(r, e.length ? e[0] : {}, r.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let s = 1; s < e.length; s++) {
    e[s].filter === !1 && (t = !1);
    let o = !!e[s].sequential;
    i = hf(i, no(r, e[s], o ? i.changes.newLength : r.doc.length), o);
  }
  let n = ne.create(r, i.changes, i.selection, i.effects, i.annotations, i.scrollIntoView);
  return km(t ? xm(n) : n);
}
function xm(r) {
  let e = r.startState, t = !0;
  for (let n of e.facet(sf)) {
    let s = n(r);
    if (s === !1) {
      t = !1;
      break;
    }
    Array.isArray(s) && (t = t === !0 ? s : ym(t, s));
  }
  if (t !== !0) {
    let n, s;
    if (t === !1)
      s = r.changes.invertedDesc, n = le.empty(e.doc.length);
    else {
      let o = r.changes.filter(t);
      n = o.changes, s = o.filtered.mapDesc(o.changes).invertedDesc;
    }
    r = ne.create(e, n, r.selection && r.selection.map(s), M.mapEffects(r.effects, s), r.annotations, r.scrollIntoView);
  }
  let i = e.facet(of);
  for (let n = i.length - 1; n >= 0; n--) {
    let s = i[n](r);
    s instanceof ne ? r = s : Array.isArray(s) && s.length == 1 && s[0] instanceof ne ? r = s[0] : r = cf(e, di(s), !1);
  }
  return r;
}
function km(r) {
  let e = r.startState, t = e.facet(lf), i = r;
  for (let n = t.length - 1; n >= 0; n--) {
    let s = t[n](r);
    s && Object.keys(s).length && (i = hf(i, no(e, s, r.changes.newLength), !0));
  }
  return i == r ? r : ne.create(e, r.changes, r.selection, i.effects, i.annotations, i.scrollIntoView);
}
const Qm = [];
function di(r) {
  return r == null ? Qm : Array.isArray(r) ? r : [r];
}
var ee = /* @__PURE__ */ function(r) {
  return r[r.Word = 0] = "Word", r[r.Space = 1] = "Space", r[r.Other = 2] = "Other", r;
}(ee || (ee = {}));
const wm = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let so;
try {
  so = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function Pm(r) {
  if (so)
    return so.test(r);
  for (let e = 0; e < r.length; e++) {
    let t = r[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || wm.test(t)))
      return !0;
  }
  return !1;
}
function $m(r) {
  return (e) => {
    if (!/\S/.test(e))
      return ee.Space;
    if (Pm(e))
      return ee.Word;
    for (let t = 0; t < r.length; t++)
      if (e.indexOf(r[t]) > -1)
        return ee.Word;
    return ee.Other;
  };
}
class B {
  constructor(e, t, i, n, s, o) {
    this.config = e, this.doc = t, this.selection = i, this.values = n, this.status = e.statusTemplate.slice(), this.computeSlot = s, o && (o._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      Fi(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let i = this.config.address[e.id];
    if (i == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return Fi(this, i), Rn(this, i);
  }
  /**
  Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
  state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
  can be passed. Unless
  [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
  [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
  are assumed to start in the _current_ document (not the document
  produced by previous specs), and its
  [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
  [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
  to the document created by its _own_ changes. The resulting
  transaction contains the combined effect of all the different
  specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
  specs take precedence over earlier ones.
  */
  update(...e) {
    return cf(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: i, compartments: n } = t;
    for (let l of e.effects)
      l.is(vr.reconfigure) ? (t && (n = /* @__PURE__ */ new Map(), t.compartments.forEach((a, h) => n.set(h, a)), t = null), n.set(l.value.compartment, l.value.extension)) : l.is(M.reconfigure) ? (t = null, i = l.value) : l.is(M.appendConfig) && (t = null, i = di(i).concat(l.value));
    let s;
    t ? s = e.startState.values.slice() : (t = An.resolve(i, n, this), s = new B(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (a, h) => h.reconfigure(a, this), null).values);
    let o = e.startState.facet(ro) ? e.newSelection : e.newSelection.asSingle();
    new B(t, e.newDoc, o, s, (l, a) => a.update(l, e), e);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: y.cursor(t.from + e.length)
    }));
  }
  /**
  Create a set of changes and a new selection by running the given
  function for each range in the active selection. The function
  can return an optional set of changes (in the coordinate space
  of the start document), plus an updated range (in the coordinate
  space of the document produced by the call's own changes). This
  method will merge all the changes and ranges into a single
  changeset and selection, and return it as a [transaction
  spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
  [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
  */
  changeByRange(e) {
    let t = this.selection, i = e(t.ranges[0]), n = this.changes(i.changes), s = [i.range], o = di(i.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), h = this.changes(a.changes), c = h.map(n);
      for (let d = 0; d < l; d++)
        s[d] = s[d].map(c);
      let f = n.mapDesc(h, !0);
      s.push(a.range.map(f)), n = n.compose(c), o = M.mapEffects(o, c).concat(M.mapEffects(di(a.effects), f));
    }
    return {
      changes: n,
      selection: y.create(s, t.mainIndex),
      effects: o
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(e = []) {
    return e instanceof le ? e : le.of(e, this.doc.length, this.facet(B.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return L.of(e.split(this.facet(B.lineSeparator) || Ks));
  }
  /**
  Return the given range of the document as a string.
  */
  sliceDoc(e = 0, t = this.doc.length) {
    return this.doc.sliceString(e, t, this.lineBreak);
  }
  /**
  Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
  */
  facet(e) {
    let t = this.config.address[e.id];
    return t == null ? e.default : (Fi(this, t), Rn(this, t));
  }
  /**
  Convert this state to a JSON-serializable object. When custom
  fields should be serialized, you can pass them in as an object
  mapping property names (in the resulting object, which should
  not use `doc` or `selection`) to fields.
  */
  toJSON(e) {
    let t = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (e)
      for (let i in e) {
        let n = e[i];
        n instanceof he && this.config.address[n.id] != null && (t[i] = n.spec.toJSON(this.field(e[i]), this));
      }
    return t;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(e, t = {}, i) {
    if (!e || typeof e.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let n = [];
    if (i) {
      for (let s in i)
        if (Object.prototype.hasOwnProperty.call(e, s)) {
          let o = i[s], l = e[s];
          n.push(o.init((a) => o.spec.fromJSON(l, a)));
        }
    }
    return B.create({
      doc: e.doc,
      selection: y.fromJSON(e.selection),
      extensions: t.extensions ? n.concat([t.extensions]) : n
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(e = {}) {
    let t = An.resolve(e.extensions || [], /* @__PURE__ */ new Map()), i = e.doc instanceof L ? e.doc : L.of((e.doc || "").split(t.staticFacet(B.lineSeparator) || Ks)), n = e.selection ? e.selection instanceof y ? e.selection : y.single(e.selection.anchor, e.selection.head) : y.single(0);
    return ef(n, i.length), t.staticFacet(ro) || (n = n.asSingle()), new B(t, i, n, t.dynamicSlots.map(() => null), (s, o) => o.create(s), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(B.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(B.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(af);
  }
  /**
  Look up a translation for the given phrase (via the
  [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
  original string if no translation is found.
  
  If additional arguments are passed, they will be inserted in
  place of markers like `$1` (for the first value) and `$2`, etc.
  A single `$` is equivalent to `$1`, and `$$` will produce a
  literal dollar sign.
  */
  phrase(e, ...t) {
    for (let i of this.facet(B.phrases))
      if (Object.prototype.hasOwnProperty.call(i, e)) {
        e = i[e];
        break;
      }
    return t.length && (e = e.replace(/\$(\$|\d*)/g, (i, n) => {
      if (n == "$")
        return "$";
      let s = +(n || 1);
      return !s || s > t.length ? i : t[s - 1];
    })), e;
  }
  /**
  Find the values for a given language data field, provided by the
  the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
  
  Examples of language data fields are...
  
  - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
    comment syntax.
  - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
    for providing language-specific completion sources.
  - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
    characters that should be considered part of words in this
    language.
  - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
    bracket closing behavior.
  */
  languageDataAt(e, t, i = -1) {
    let n = [];
    for (let s of this.facet(rf))
      for (let o of s(this, t, i))
        Object.prototype.hasOwnProperty.call(o, e) && n.push(o[e]);
    return n;
  }
  /**
  Return a function that can categorize strings (expected to
  represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
  into one of:
  
   - Word (contains an alphanumeric character or a character
     explicitly listed in the local language's `"wordChars"`
     language data, which should be a string)
   - Space (contains only whitespace)
   - Other (anything else)
  */
  charCategorizer(e) {
    return $m(this.languageDataAt("wordChars", e).join(""));
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(e) {
    let { text: t, from: i, length: n } = this.doc.lineAt(e), s = this.charCategorizer(e), o = e - i, l = e - i;
    for (; o > 0; ) {
      let a = pe(t, o, !1);
      if (s(t.slice(a, o)) != ee.Word)
        break;
      o = a;
    }
    for (; l < n; ) {
      let a = pe(t, l);
      if (s(t.slice(l, a)) != ee.Word)
        break;
      l = a;
    }
    return o == l ? null : y.range(o + i, l + i);
  }
}
B.allowMultipleSelections = ro;
B.tabSize = /* @__PURE__ */ T.define({
  combine: (r) => r.length ? r[0] : 4
});
B.lineSeparator = nf;
B.readOnly = af;
B.phrases = /* @__PURE__ */ T.define({
  compare(r, e) {
    let t = Object.keys(r), i = Object.keys(e);
    return t.length == i.length && t.every((n) => r[n] == e[n]);
  }
});
B.languageData = rf;
B.changeFilter = sf;
B.transactionFilter = of;
B.transactionExtender = lf;
vr.reconfigure = /* @__PURE__ */ M.define();
function ut(r, e, t = {}) {
  let i = {};
  for (let n of r)
    for (let s of Object.keys(n)) {
      let o = n[s], l = i[s];
      if (l === void 0)
        i[s] = o;
      else if (!(l === o || o === void 0)) if (Object.hasOwnProperty.call(t, s))
        i[s] = t[s](l, o);
      else
        throw new Error("Config merge conflict for field " + s);
    }
  for (let n in e)
    i[n] === void 0 && (i[n] = e[n]);
  return i;
}
class Ft {
  /**
  Compare this value with another value. Used when comparing
  rangesets. The default implementation compares by identity.
  Unless you are only creating a fixed number of unique instances
  of your value type, it is a good idea to implement this
  properly.
  */
  eq(e) {
    return this == e;
  }
  /**
  Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
  */
  range(e, t = e) {
    return or.create(e, t, this);
  }
}
Ft.prototype.startSide = Ft.prototype.endSide = 0;
Ft.prototype.point = !1;
Ft.prototype.mapMode = de.TrackDel;
class or {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.value = i;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new or(e, t, i);
  }
}
function oo(r, e) {
  return r.from - e.from || r.value.startSide - e.value.startSide;
}
class al {
  constructor(e, t, i, n) {
    this.from = e, this.to = t, this.value = i, this.maxPoint = n;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(e, t, i, n = 0) {
    let s = i ? this.to : this.from;
    for (let o = n, l = s.length; ; ) {
      if (o == l)
        return o;
      let a = o + l >> 1, h = s[a] - e || (i ? this.value[a].endSide : this.value[a].startSide) - t;
      if (a == o)
        return h >= 0 ? o : l;
      h >= 0 ? l = a : o = a + 1;
    }
  }
  between(e, t, i, n) {
    for (let s = this.findIndex(t, -1e9, !0), o = this.findIndex(i, 1e9, !1, s); s < o; s++)
      if (n(this.from[s] + e, this.to[s] + e, this.value[s]) === !1)
        return !1;
  }
  map(e, t) {
    let i = [], n = [], s = [], o = -1, l = -1;
    for (let a = 0; a < this.value.length; a++) {
      let h = this.value[a], c = this.from[a] + e, f = this.to[a] + e, d, O;
      if (c == f) {
        let p = t.mapPos(c, h.startSide, h.mapMode);
        if (p == null || (d = O = p, h.startSide != h.endSide && (O = t.mapPos(c, h.endSide), O < d)))
          continue;
      } else if (d = t.mapPos(c, h.startSide), O = t.mapPos(f, h.endSide), d > O || d == O && h.startSide > 0 && h.endSide <= 0)
        continue;
      (O - d || h.endSide - h.startSide) < 0 || (o < 0 && (o = d), h.point && (l = Math.max(l, O - d)), i.push(h), n.push(d - o), s.push(O - o));
    }
    return { mapped: i.length ? new al(n, s, i, l) : null, pos: o };
  }
}
class z {
  constructor(e, t, i, n) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = i, this.maxPoint = n;
  }
  /**
  @internal
  */
  static create(e, t, i, n) {
    return new z(e, t, i, n);
  }
  /**
  @internal
  */
  get length() {
    let e = this.chunk.length - 1;
    return e < 0 ? 0 : Math.max(this.chunkEnd(e), this.nextLayer.length);
  }
  /**
  The number of ranges in the set.
  */
  get size() {
    if (this.isEmpty)
      return 0;
    let e = this.nextLayer.size;
    for (let t of this.chunk)
      e += t.value.length;
    return e;
  }
  /**
  @internal
  */
  chunkEnd(e) {
    return this.chunkPos[e] + this.chunk[e].length;
  }
  /**
  Update the range set, optionally adding new ranges or filtering
  out existing ones.
  
  (Note: The type parameter is just there as a kludge to work
  around TypeScript variance issues that prevented `RangeSet<X>`
  from being a subtype of `RangeSet<Y>` when `X` is a subtype of
  `Y`.)
  */
  update(e) {
    let { add: t = [], sort: i = !1, filterFrom: n = 0, filterTo: s = this.length } = e, o = e.filter;
    if (t.length == 0 && !o)
      return this;
    if (i && (t = t.slice().sort(oo)), this.isEmpty)
      return t.length ? z.of(t) : this;
    let l = new ff(this, null, -1).goto(0), a = 0, h = [], c = new Et();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let f = t[a++];
        c.addInner(f.from, f.to, f.value) || h.push(f);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!o || n > this.chunkEnd(l.chunkIndex) || s < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!o || n > l.to || s < l.from || o(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value) || h.push(or.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !h.length ? z.empty : this.nextLayer.update({ add: h, filter: o, filterFrom: n, filterTo: s }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], i = [], n = -1;
    for (let o = 0; o < this.chunk.length; o++) {
      let l = this.chunkPos[o], a = this.chunk[o], h = e.touchesRange(l, l + a.length);
      if (h === !1)
        n = Math.max(n, a.maxPoint), t.push(a), i.push(e.mapPos(l));
      else if (h === !0) {
        let { mapped: c, pos: f } = a.map(l, e);
        c && (n = Math.max(n, c.maxPoint), t.push(c), i.push(f));
      }
    }
    let s = this.nextLayer.map(e);
    return t.length == 0 ? s : new z(i, t, s || z.empty, n);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(e, t, i) {
    if (!this.isEmpty) {
      for (let n = 0; n < this.chunk.length; n++) {
        let s = this.chunkPos[n], o = this.chunk[n];
        if (t >= s && e <= s + o.length && o.between(s, e - s, t - s, i) === !1)
          return;
      }
      this.nextLayer.between(e, t, i);
    }
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(e = 0) {
    return lr.from([this]).goto(e);
  }
  /**
  @internal
  */
  get isEmpty() {
    return this.nextLayer == this;
  }
  /**
  Iterate over the ranges in a collection of sets, in order,
  starting from `from`.
  */
  static iter(e, t = 0) {
    return lr.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, i, n, s = -1) {
    let o = e.filter((f) => f.maxPoint > 0 || !f.isEmpty && f.maxPoint >= s), l = t.filter((f) => f.maxPoint > 0 || !f.isEmpty && f.maxPoint >= s), a = $a(o, l, i), h = new Wi(o, a, s), c = new Wi(l, a, s);
    i.iterGaps((f, d, O) => va(h, f, c, d, O, n)), i.empty && i.length == 0 && va(h, 0, c, 0, 0, n);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(e, t, i = 0, n) {
    n == null && (n = 999999999);
    let s = e.filter((c) => !c.isEmpty && t.indexOf(c) < 0), o = t.filter((c) => !c.isEmpty && e.indexOf(c) < 0);
    if (s.length != o.length)
      return !1;
    if (!s.length)
      return !0;
    let l = $a(s, o), a = new Wi(s, l, 0).goto(i), h = new Wi(o, l, 0).goto(i);
    for (; ; ) {
      if (a.to != h.to || !lo(a.active, h.active) || a.point && (!h.point || !a.point.eq(h.point)))
        return !1;
      if (a.to > n)
        return !0;
      a.next(), h.next();
    }
  }
  /**
  Iterate over a group of range sets at the same time, notifying
  the iterator about the ranges covering every given piece of
  content. Returns the open count (see
  [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
  of the iteration.
  */
  static spans(e, t, i, n, s = -1) {
    let o = new Wi(e, null, s).goto(t), l = t, a = o.openStart;
    for (; ; ) {
      let h = Math.min(o.to, i);
      if (o.point) {
        let c = o.activeForPoint(o.to), f = o.pointFrom < t ? c.length + 1 : o.point.startSide < 0 ? c.length : Math.min(c.length, a);
        n.point(l, h, o.point, c, f, o.pointRank), a = Math.min(o.openEnd(h), c.length);
      } else h > l && (n.span(l, h, o.active, a), a = o.openEnd(h));
      if (o.to > i)
        return a + (o.point && o.to > i ? 1 : 0);
      l = o.to, o.next();
    }
  }
  /**
  Create a range set for the given range or array of ranges. By
  default, this expects the ranges to be _sorted_ (by start
  position and, if two start at the same position,
  `value.startSide`). You can pass `true` as second argument to
  cause the method to sort them.
  */
  static of(e, t = !1) {
    let i = new Et();
    for (let n of e instanceof or ? [e] : t ? vm(e) : e)
      i.add(n.from, n.to, n.value);
    return i.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return z.empty;
    let t = e[e.length - 1];
    for (let i = e.length - 2; i >= 0; i--)
      for (let n = e[i]; n != z.empty; n = n.nextLayer)
        t = new z(n.chunkPos, n.chunk, t, Math.max(n.maxPoint, t.maxPoint));
    return t;
  }
}
z.empty = /* @__PURE__ */ new z([], [], null, -1);
function vm(r) {
  if (r.length > 1)
    for (let e = r[0], t = 1; t < r.length; t++) {
      let i = r[t];
      if (oo(e, i) > 0)
        return r.slice().sort(oo);
      e = i;
    }
  return r;
}
z.empty.nextLayer = z.empty;
class Et {
  finishChunk(e) {
    this.chunks.push(new al(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
  }
  /**
  Create an empty builder.
  */
  constructor() {
    this.chunks = [], this.chunkPos = [], this.chunkStart = -1, this.last = null, this.lastFrom = -1e9, this.lastTo = -1e9, this.from = [], this.to = [], this.value = [], this.maxPoint = -1, this.setMaxPoint = -1, this.nextLayer = null;
  }
  /**
  Add a range. Ranges should be added in sorted (by `from` and
  `value.startSide`) order.
  */
  add(e, t, i) {
    this.addInner(e, t, i) || (this.nextLayer || (this.nextLayer = new Et())).add(e, t, i);
  }
  /**
  @internal
  */
  addInner(e, t, i) {
    let n = e - this.lastTo || i.startSide - this.last.endSide;
    if (n <= 0 && (e - this.lastFrom || i.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return n < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = e), this.from.push(e - this.chunkStart), this.to.push(t - this.chunkStart), this.last = i, this.lastFrom = e, this.lastTo = t, this.value.push(i), i.point && (this.maxPoint = Math.max(this.maxPoint, t - e)), !0);
  }
  /**
  @internal
  */
  addChunk(e, t) {
    if ((e - this.lastTo || t.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, t.maxPoint), this.chunks.push(t), this.chunkPos.push(e);
    let i = t.value.length - 1;
    return this.last = t.value[i], this.lastFrom = t.from[i] + e, this.lastTo = t.to[i] + e, !0;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(z.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = z.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function $a(r, e, t) {
  let i = /* @__PURE__ */ new Map();
  for (let s of r)
    for (let o = 0; o < s.chunk.length; o++)
      s.chunk[o].maxPoint <= 0 && i.set(s.chunk[o], s.chunkPos[o]);
  let n = /* @__PURE__ */ new Set();
  for (let s of e)
    for (let o = 0; o < s.chunk.length; o++) {
      let l = i.get(s.chunk[o]);
      l != null && (t ? t.mapPos(l) : l) == s.chunkPos[o] && !(t != null && t.touchesRange(l, l + s.chunk[o].length)) && n.add(s.chunk[o]);
    }
  return n;
}
class ff {
  constructor(e, t, i, n = 0) {
    this.layer = e, this.skip = t, this.minPoint = i, this.rank = n;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(e, t = -1e9) {
    return this.chunkIndex = this.rangeIndex = 0, this.gotoInner(e, t, !1), this;
  }
  gotoInner(e, t, i) {
    for (; this.chunkIndex < this.layer.chunk.length; ) {
      let n = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(n) || this.layer.chunkEnd(this.chunkIndex) < e || n.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, i = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let n = this.layer.chunk[this.chunkIndex].findIndex(e - this.layer.chunkPos[this.chunkIndex], t, !0);
      (!i || this.rangeIndex < n) && this.setRangeIndex(n);
    }
    this.next();
  }
  forward(e, t) {
    (this.to - e || this.endSide - t) < 0 && this.gotoInner(e, t, !0);
  }
  next() {
    for (; ; )
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9, this.value = null;
        break;
      } else {
        let e = this.layer.chunkPos[this.chunkIndex], t = this.layer.chunk[this.chunkIndex], i = e + t.from[this.rangeIndex];
        if (this.from = i, this.to = e + t.to[this.rangeIndex], this.value = t.value[this.rangeIndex], this.setRangeIndex(this.rangeIndex + 1), this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
  }
  setRangeIndex(e) {
    if (e == this.layer.chunk[this.chunkIndex].value.length) {
      if (this.chunkIndex++, this.skip)
        for (; this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]); )
          this.chunkIndex++;
      this.rangeIndex = 0;
    } else
      this.rangeIndex = e;
  }
  nextChunk() {
    this.chunkIndex++, this.rangeIndex = 0, this.next();
  }
  compare(e) {
    return this.from - e.from || this.startSide - e.startSide || this.rank - e.rank || this.to - e.to || this.endSide - e.endSide;
  }
}
class lr {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, i = -1) {
    let n = [];
    for (let s = 0; s < e.length; s++)
      for (let o = e[s]; !o.isEmpty; o = o.nextLayer)
        o.maxPoint >= i && n.push(new ff(o, t, i, s));
    return n.length == 1 ? n[0] : new lr(n);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let i of this.heap)
      i.goto(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      ps(this.heap, i);
    return this.next(), this;
  }
  forward(e, t) {
    for (let i of this.heap)
      i.forward(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      ps(this.heap, i);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), ps(this.heap, 0);
    }
  }
}
function ps(r, e) {
  for (let t = r[e]; ; ) {
    let i = (e << 1) + 1;
    if (i >= r.length)
      break;
    let n = r[i];
    if (i + 1 < r.length && n.compare(r[i + 1]) >= 0 && (n = r[i + 1], i++), t.compare(n) < 0)
      break;
    r[i] = t, r[e] = n, e = i;
  }
}
class Wi {
  constructor(e, t, i) {
    this.minPoint = i, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = lr.from(e, t, i);
  }
  goto(e, t = -1e9) {
    return this.cursor.goto(e, t), this.active.length = this.activeTo.length = this.activeRank.length = 0, this.minActive = -1, this.to = e, this.endSide = t, this.openStart = -1, this.next(), this;
  }
  forward(e, t) {
    for (; this.minActive > -1 && (this.activeTo[this.minActive] - e || this.active[this.minActive].endSide - t) < 0; )
      this.removeActive(this.minActive);
    this.cursor.forward(e, t);
  }
  removeActive(e) {
    Lr(this.active, e), Lr(this.activeTo, e), Lr(this.activeRank, e), this.minActive = Ca(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: i, to: n, rank: s } = this.cursor;
    for (; t < this.activeRank.length && (s - this.activeRank[t] || n - this.activeTo[t]) > 0; )
      t++;
    Nr(this.active, t, i), Nr(this.activeTo, t, n), Nr(this.activeRank, t, s), e && Nr(e, t, this.cursor.from), this.minActive = Ca(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let e = this.to, t = this.point;
    this.point = null;
    let i = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let n = this.minActive;
      if (n > -1 && (this.activeTo[n] - this.cursor.from || this.active[n].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[n] > e) {
          this.to = this.activeTo[n], this.endSide = this.active[n].endSide;
          break;
        }
        this.removeActive(n), i && Lr(i, n);
      } else if (this.cursor.value)
        if (this.cursor.from > e) {
          this.to = this.cursor.from, this.endSide = this.cursor.startSide;
          break;
        } else {
          let s = this.cursor.value;
          if (!s.point)
            this.addActive(i), this.cursor.next();
          else if (t && this.cursor.to == this.to && this.cursor.from < this.cursor.to)
            this.cursor.next();
          else {
            this.point = s, this.pointFrom = this.cursor.from, this.pointRank = this.cursor.rank, this.to = this.cursor.to, this.endSide = s.endSide, this.cursor.next(), this.forward(this.to, this.endSide);
            break;
          }
        }
      else {
        this.to = this.endSide = 1e9;
        break;
      }
    }
    if (i) {
      this.openStart = 0;
      for (let n = i.length - 1; n >= 0 && i[n] < e; n--)
        this.openStart++;
    }
  }
  activeForPoint(e) {
    if (!this.active.length)
      return this.active;
    let t = [];
    for (let i = this.active.length - 1; i >= 0 && !(this.activeRank[i] < this.pointRank); i--)
      (this.activeTo[i] > e || this.activeTo[i] == e && this.active[i].endSide >= this.point.endSide) && t.push(this.active[i]);
    return t.reverse();
  }
  openEnd(e) {
    let t = 0;
    for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > e; i--)
      t++;
    return t;
  }
}
function va(r, e, t, i, n, s) {
  r.goto(e), t.goto(i);
  let o = i + n, l = i, a = i - e;
  for (; ; ) {
    let h = r.to + a - t.to || r.endSide - t.endSide, c = h < 0 ? r.to + a : t.to, f = Math.min(c, o);
    if (r.point || t.point ? r.point && t.point && (r.point == t.point || r.point.eq(t.point)) && lo(r.activeForPoint(r.to), t.activeForPoint(t.to)) || s.comparePoint(l, f, r.point, t.point) : f > l && !lo(r.active, t.active) && s.compareRange(l, f, r.active, t.active), c > o)
      break;
    l = c, h <= 0 && r.next(), h >= 0 && t.next();
  }
}
function lo(r, e) {
  if (r.length != e.length)
    return !1;
  for (let t = 0; t < r.length; t++)
    if (r[t] != e[t] && !r[t].eq(e[t]))
      return !1;
  return !0;
}
function Lr(r, e) {
  for (let t = e, i = r.length - 1; t < i; t++)
    r[t] = r[t + 1];
  r.pop();
}
function Nr(r, e, t) {
  for (let i = r.length - 1; i >= e; i--)
    r[i + 1] = r[i];
  r[e] = t;
}
function Ca(r, e) {
  let t = -1, i = 1e9;
  for (let n = 0; n < e.length; n++)
    (e[n] - i || r[n].endSide - r[t].endSide) < 0 && (t = n, i = e[n]);
  return t;
}
function Ge(r, e, t = r.length) {
  let i = 0;
  for (let n = 0; n < t; )
    r.charCodeAt(n) == 9 ? (i += e - i % e, n++) : (i++, n = pe(r, n));
  return i;
}
function ao(r, e, t, i) {
  for (let n = 0, s = 0; ; ) {
    if (s >= e)
      return n;
    if (n == r.length)
      break;
    s += r.charCodeAt(n) == 9 ? t - s % t : 1, n = pe(r, n);
  }
  return i === !0 ? -1 : r.length;
}
const ho = "ͼ", Za = typeof Symbol > "u" ? "__" + ho : Symbol.for(ho), co = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet"), Ta = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class Wt {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(e, t) {
    this.rules = [];
    let { finish: i } = t || {};
    function n(o) {
      return /^@/.test(o) ? [o] : o.split(/,\s*/);
    }
    function s(o, l, a, h) {
      let c = [], f = /^@(\w+)\b/.exec(o[0]), d = f && f[1] == "keyframes";
      if (f && l == null) return a.push(o[0] + ";");
      for (let O in l) {
        let p = l[O];
        if (/&/.test(O))
          s(
            O.split(/,\s*/).map((m) => o.map((g) => m.replace(/&/, g))).reduce((m, g) => m.concat(g)),
            p,
            a
          );
        else if (p && typeof p == "object") {
          if (!f) throw new RangeError("The value of a property (" + O + ") should be a primitive value.");
          s(n(O), p, c, d);
        } else p != null && c.push(O.replace(/_.*/, "").replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + ": " + p + ";");
      }
      (c.length || d) && a.push((i && !f && !h ? o.map(i) : o).join(", ") + " {" + c.join(" ") + "}");
    }
    for (let o in e) s(n(o), e[o], this.rules);
  }
  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() {
    return this.rules.join(`
`);
  }
  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let e = Ta[Za] || 1;
    return Ta[Za] = e + 1, ho + e.toString(36);
  }
  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  //
  // If a Content Security Policy nonce is provided, it is added to
  // the `<style>` tag generated by the library.
  static mount(e, t, i) {
    let n = e[co], s = i && i.nonce;
    n ? s && n.setNonce(s) : n = new Cm(e, s), n.mount(Array.isArray(t) ? t : [t], e);
  }
}
let Aa = /* @__PURE__ */ new Map();
class Cm {
  constructor(e, t) {
    let i = e.ownerDocument || e, n = i.defaultView;
    if (!e.head && e.adoptedStyleSheets && n.CSSStyleSheet) {
      let s = Aa.get(i);
      if (s) return e[co] = s;
      this.sheet = new n.CSSStyleSheet(), Aa.set(i, this);
    } else
      this.styleTag = i.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[co] = this;
  }
  mount(e, t) {
    let i = this.sheet, n = 0, s = 0;
    for (let o = 0; o < e.length; o++) {
      let l = e[o], a = this.modules.indexOf(l);
      if (a < s && a > -1 && (this.modules.splice(a, 1), s--, a = -1), a == -1) {
        if (this.modules.splice(s++, 0, l), i) for (let h = 0; h < l.rules.length; h++)
          i.insertRule(l.rules[h], n++);
      } else {
        for (; s < a; ) n += this.modules[s++].rules.length;
        n += l.rules.length, s++;
      }
    }
    if (i)
      t.adoptedStyleSheets.indexOf(this.sheet) < 0 && (t.adoptedStyleSheets = [this.sheet, ...t.adoptedStyleSheets]);
    else {
      let o = "";
      for (let a = 0; a < this.modules.length; a++)
        o += this.modules[a].getRules() + `
`;
      this.styleTag.textContent = o;
      let l = t.head || t;
      this.styleTag.parentNode != l && l.insertBefore(this.styleTag, l.firstChild);
    }
  }
  setNonce(e) {
    this.styleTag && this.styleTag.getAttribute("nonce") != e && this.styleTag.setAttribute("nonce", e);
  }
}
var Yt = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, ar = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, Zm = typeof navigator < "u" && /Mac/.test(navigator.platform), Tm = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var ue = 0; ue < 10; ue++) Yt[48 + ue] = Yt[96 + ue] = String(ue);
for (var ue = 1; ue <= 24; ue++) Yt[ue + 111] = "F" + ue;
for (var ue = 65; ue <= 90; ue++)
  Yt[ue] = String.fromCharCode(ue + 32), ar[ue] = String.fromCharCode(ue);
for (var ms in Yt) ar.hasOwnProperty(ms) || (ar[ms] = Yt[ms]);
function Am(r) {
  var e = Zm && r.metaKey && r.shiftKey && !r.ctrlKey && !r.altKey || Tm && r.shiftKey && r.key && r.key.length == 1 || r.key == "Unidentified", t = !e && r.key || (r.shiftKey ? ar : Yt)[r.keyCode] || r.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
function hr(r) {
  let e;
  return r.nodeType == 11 ? e = r.getSelection ? r : r.ownerDocument : e = r, e.getSelection();
}
function fo(r, e) {
  return e ? r == e || r.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Rm(r) {
  let e = r.activeElement;
  for (; e && e.shadowRoot; )
    e = e.shadowRoot.activeElement;
  return e;
}
function mn(r, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return fo(r, e.anchorNode);
  } catch {
    return !1;
  }
}
function cr(r) {
  return r.nodeType == 3 ? Kt(r, 0, r.nodeValue.length).getClientRects() : r.nodeType == 1 ? r.getClientRects() : [];
}
function Hi(r, e, t, i) {
  return t ? Ra(r, e, t, i, -1) || Ra(r, e, t, i, 1) : !1;
}
function Ht(r) {
  for (var e = 0; ; e++)
    if (r = r.previousSibling, !r)
      return e;
}
function Xn(r) {
  return r.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(r.nodeName);
}
function Ra(r, e, t, i, n) {
  for (; ; ) {
    if (r == t && e == i)
      return !0;
    if (e == (n < 0 ? 0 : gt(r))) {
      if (r.nodeName == "DIV")
        return !1;
      let s = r.parentNode;
      if (!s || s.nodeType != 1)
        return !1;
      e = Ht(r) + (n < 0 ? 0 : 1), r = s;
    } else if (r.nodeType == 1) {
      if (r = r.childNodes[e + (n < 0 ? -1 : 0)], r.nodeType == 1 && r.contentEditable == "false")
        return !1;
      e = n < 0 ? gt(r) : 0;
    } else
      return !1;
  }
}
function gt(r) {
  return r.nodeType == 3 ? r.nodeValue.length : r.childNodes.length;
}
function hl(r, e) {
  let t = e ? r.left : r.right;
  return { left: t, right: t, top: r.top, bottom: r.bottom };
}
function Xm(r) {
  let e = r.visualViewport;
  return e ? {
    left: 0,
    right: e.width,
    top: 0,
    bottom: e.height
  } : {
    left: 0,
    right: r.innerWidth,
    top: 0,
    bottom: r.innerHeight
  };
}
function uf(r, e) {
  let t = e.width / r.offsetWidth, i = e.height / r.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - r.offsetWidth) < 1) && (t = 1), (i > 0.995 && i < 1.005 || !isFinite(i) || Math.abs(e.height - r.offsetHeight) < 1) && (i = 1), { scaleX: t, scaleY: i };
}
function Mm(r, e, t, i, n, s, o, l) {
  let a = r.ownerDocument, h = a.defaultView || window;
  for (let c = r, f = !1; c && !f; )
    if (c.nodeType == 1) {
      let d, O = c == a.body, p = 1, m = 1;
      if (O)
        d = Xm(h);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(c).position) && (f = !0), c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let S = c.getBoundingClientRect();
        ({ scaleX: p, scaleY: m } = uf(c, S)), d = {
          left: S.left,
          right: S.left + c.clientWidth * p,
          top: S.top,
          bottom: S.top + c.clientHeight * m
        };
      }
      let g = 0, b = 0;
      if (n == "nearest")
        e.top < d.top ? (b = -(d.top - e.top + o), t > 0 && e.bottom > d.bottom + b && (b = e.bottom - d.bottom + b + o)) : e.bottom > d.bottom && (b = e.bottom - d.bottom + o, t < 0 && e.top - b < d.top && (b = -(d.top + b - e.top + o)));
      else {
        let S = e.bottom - e.top, k = d.bottom - d.top;
        b = (n == "center" && S <= k ? e.top + S / 2 - k / 2 : n == "start" || n == "center" && t < 0 ? e.top - o : e.bottom - k + o) - d.top;
      }
      if (i == "nearest" ? e.left < d.left ? (g = -(d.left - e.left + s), t > 0 && e.right > d.right + g && (g = e.right - d.right + g + s)) : e.right > d.right && (g = e.right - d.right + s, t < 0 && e.left < d.left + g && (g = -(d.left + g - e.left + s))) : g = (i == "center" ? e.left + (e.right - e.left) / 2 - (d.right - d.left) / 2 : i == "start" == l ? e.left - s : e.right - (d.right - d.left) + s) - d.left, g || b)
        if (O)
          h.scrollBy(g, b);
        else {
          let S = 0, k = 0;
          if (b) {
            let Q = c.scrollTop;
            c.scrollTop += b / m, k = (c.scrollTop - Q) * m;
          }
          if (g) {
            let Q = c.scrollLeft;
            c.scrollLeft += g / p, S = (c.scrollLeft - Q) * p;
          }
          e = {
            left: e.left - S,
            top: e.top - k,
            right: e.right - S,
            bottom: e.bottom - k
          }, S && Math.abs(S - g) < 1 && (i = "nearest"), k && Math.abs(k - b) < 1 && (n = "nearest");
        }
      if (O)
        break;
      c = c.assignedSlot || c.parentNode;
    } else if (c.nodeType == 11)
      c = c.host;
    else
      break;
}
function Em(r) {
  let e = r.ownerDocument, t, i;
  for (let n = r.parentNode; n && !(n == e.body || t && i); )
    if (n.nodeType == 1)
      !i && n.scrollHeight > n.clientHeight && (i = n), !t && n.scrollWidth > n.clientWidth && (t = n), n = n.assignedSlot || n.parentNode;
    else if (n.nodeType == 11)
      n = n.host;
    else
      break;
  return { x: t, y: i };
}
class Wm {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: i } = e;
    this.set(t, Math.min(e.anchorOffset, t ? gt(t) : 0), i, Math.min(e.focusOffset, i ? gt(i) : 0));
  }
  set(e, t, i, n) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = i, this.focusOffset = n;
  }
}
let si = null;
function df(r) {
  if (r.setActive)
    return r.setActive();
  if (si)
    return r.focus(si);
  let e = [];
  for (let t = r; t && (e.push(t, t.scrollTop, t.scrollLeft), t != t.ownerDocument); t = t.parentNode)
    ;
  if (r.focus(si == null ? {
    get preventScroll() {
      return si = { preventScroll: !0 }, !0;
    }
  } : void 0), !si) {
    si = !1;
    for (let t = 0; t < e.length; ) {
      let i = e[t++], n = e[t++], s = e[t++];
      i.scrollTop != n && (i.scrollTop = n), i.scrollLeft != s && (i.scrollLeft = s);
    }
  }
}
let Xa;
function Kt(r, e, t = e) {
  let i = Xa || (Xa = document.createRange());
  return i.setEnd(r, t), i.setStart(r, e), i;
}
function Oi(r, e, t, i) {
  let n = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  i && ({ altKey: n.altKey, ctrlKey: n.ctrlKey, shiftKey: n.shiftKey, metaKey: n.metaKey } = i);
  let s = new KeyboardEvent("keydown", n);
  s.synthetic = !0, r.dispatchEvent(s);
  let o = new KeyboardEvent("keyup", n);
  return o.synthetic = !0, r.dispatchEvent(o), s.defaultPrevented || o.defaultPrevented;
}
function Ym(r) {
  for (; r; ) {
    if (r && (r.nodeType == 9 || r.nodeType == 11 && r.host))
      return r;
    r = r.assignedSlot || r.parentNode;
  }
  return null;
}
function Of(r) {
  for (; r.attributes.length; )
    r.removeAttributeNode(r.attributes[0]);
}
function Dm(r, e) {
  let t = e.focusNode, i = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != i)
    return !1;
  for (i = Math.min(i, gt(t)); ; )
    if (i) {
      if (t.nodeType != 1)
        return !1;
      let n = t.childNodes[i - 1];
      n.contentEditable == "false" ? i-- : (t = n, i = gt(t));
    } else {
      if (t == r)
        return !0;
      i = Ht(t), t = t.parentNode;
    }
}
function pf(r) {
  return r.scrollTop > Math.max(1, r.scrollHeight - r.clientHeight - 4);
}
function mf(r, e) {
  for (let t = r, i = e; ; ) {
    if (t.nodeType == 3 && i > 0)
      return { node: t, offset: i };
    if (t.nodeType == 1 && i > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i - 1], i = gt(t);
    } else if (t.parentNode && !Xn(t))
      i = Ht(t), t = t.parentNode;
    else
      return null;
  }
}
function gf(r, e) {
  for (let t = r, i = e; ; ) {
    if (t.nodeType == 3 && i < t.nodeValue.length)
      return { node: t, offset: i };
    if (t.nodeType == 1 && i < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i], i = 0;
    } else if (t.parentNode && !Xn(t))
      i = Ht(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class ge {
  constructor(e, t, i = !0) {
    this.node = e, this.offset = t, this.precise = i;
  }
  static before(e, t) {
    return new ge(e.parentNode, Ht(e), t);
  }
  static after(e, t) {
    return new ge(e.parentNode, Ht(e) + 1, t);
  }
}
const cl = [];
class j {
  constructor() {
    this.parent = null, this.dom = null, this.flags = 2;
  }
  get overrideDOMText() {
    return null;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(e) {
    let t = this.posAtStart;
    for (let i of this.children) {
      if (i == e)
        return t;
      t += i.length + i.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(e) {
    return this.posBefore(e) + e.length;
  }
  sync(e, t) {
    if (this.flags & 2) {
      let i = this.dom, n = null, s;
      for (let o of this.children) {
        if (o.flags & 7) {
          if (!o.dom && (s = n ? n.nextSibling : i.firstChild)) {
            let l = j.get(s);
            (!l || !l.parent && l.canReuseDOM(o)) && o.reuseDOM(s);
          }
          o.sync(e, t), o.flags &= -8;
        }
        if (s = n ? n.nextSibling : i.firstChild, t && !t.written && t.node == i && s != o.dom && (t.written = !0), o.dom.parentNode == i)
          for (; s && s != o.dom; )
            s = Ma(s);
        else
          i.insertBefore(o.dom, s);
        n = o.dom;
      }
      for (s = n ? n.nextSibling : i.firstChild, s && t && t.node == i && (t.written = !0); s; )
        s = Ma(s);
    } else if (this.flags & 1)
      for (let i of this.children)
        i.flags & 7 && (i.sync(e, t), i.flags &= -8);
  }
  reuseDOM(e) {
  }
  localPosFromDOM(e, t) {
    let i;
    if (e == this.dom)
      i = this.dom.childNodes[t];
    else {
      let n = gt(e) == 0 ? 0 : t == 0 ? -1 : 1;
      for (; ; ) {
        let s = e.parentNode;
        if (s == this.dom)
          break;
        n == 0 && s.firstChild != s.lastChild && (e == s.firstChild ? n = -1 : n = 1), e = s;
      }
      n < 0 ? i = e : i = e.nextSibling;
    }
    if (i == this.dom.firstChild)
      return 0;
    for (; i && !j.get(i); )
      i = i.nextSibling;
    if (!i)
      return this.length;
    for (let n = 0, s = 0; ; n++) {
      let o = this.children[n];
      if (o.dom == i)
        return s;
      s += o.length + o.breakAfter;
    }
  }
  domBoundsAround(e, t, i = 0) {
    let n = -1, s = -1, o = -1, l = -1;
    for (let a = 0, h = i, c = i; a < this.children.length; a++) {
      let f = this.children[a], d = h + f.length;
      if (h < e && d > t)
        return f.domBoundsAround(e, t, h);
      if (d >= e && n == -1 && (n = a, s = h), h > t && f.dom.parentNode == this.dom) {
        o = a, l = c;
        break;
      }
      c = d, h = d + f.breakAfter;
    }
    return {
      from: s,
      to: l < 0 ? i + this.length : l,
      startDOM: (n ? this.children[n - 1].dom.nextSibling : null) || this.dom.firstChild,
      endDOM: o < this.children.length && o >= 0 ? this.children[o].dom : null
    };
  }
  markDirty(e = !1) {
    this.flags |= 2, this.markParentsDirty(e);
  }
  markParentsDirty(e) {
    for (let t = this.parent; t; t = t.parent) {
      if (e && (t.flags |= 2), t.flags & 1)
        return;
      t.flags |= 1, e = !1;
    }
  }
  setParent(e) {
    this.parent != e && (this.parent = e, this.flags & 7 && this.markParentsDirty(!0));
  }
  setDOM(e) {
    this.dom != e && (this.dom && (this.dom.cmView = null), this.dom = e, e.cmView = this);
  }
  get rootView() {
    for (let e = this; ; ) {
      let t = e.parent;
      if (!t)
        return e;
      e = t;
    }
  }
  replaceChildren(e, t, i = cl) {
    this.markDirty();
    for (let n = e; n < t; n++) {
      let s = this.children[n];
      s.parent == this && i.indexOf(s) < 0 && s.destroy();
    }
    this.children.splice(e, t - e, ...i);
    for (let n = 0; n < i.length; n++)
      i[n].setParent(this);
  }
  ignoreMutation(e) {
    return !1;
  }
  ignoreEvent(e) {
    return !1;
  }
  childCursor(e = this.length) {
    return new bf(this.children, e, this.children.length);
  }
  childPos(e, t = 1) {
    return this.childCursor().findPos(e, t);
  }
  toString() {
    let e = this.constructor.name.replace("View", "");
    return e + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (e == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
  }
  static get(e) {
    return e.cmView;
  }
  get isEditable() {
    return !0;
  }
  get isWidget() {
    return !1;
  }
  get isHidden() {
    return !1;
  }
  merge(e, t, i, n, s, o) {
    return !1;
  }
  become(e) {
    return !1;
  }
  canReuseDOM(e) {
    return e.constructor == this.constructor && !((this.flags | e.flags) & 8);
  }
  // When this is a zero-length view with a side, this should return a
  // number <= 0 to indicate it is before its position, or a
  // number > 0 when after its position.
  getSide() {
    return 0;
  }
  destroy() {
    for (let e of this.children)
      e.parent == this && e.destroy();
    this.parent = null;
  }
}
j.prototype.breakAfter = 0;
function Ma(r) {
  let e = r.nextSibling;
  return r.parentNode.removeChild(r), e;
}
class bf {
  constructor(e, t, i) {
    this.children = e, this.pos = t, this.i = i, this.off = 0;
  }
  findPos(e, t = 1) {
    for (; ; ) {
      if (e > this.pos || e == this.pos && (t > 0 || this.i == 0 || this.children[this.i - 1].breakAfter))
        return this.off = e - this.pos, this;
      let i = this.children[--this.i];
      this.pos -= i.length + i.breakAfter;
    }
  }
}
function Sf(r, e, t, i, n, s, o, l, a) {
  let { children: h } = r, c = h.length ? h[e] : null, f = s.length ? s[s.length - 1] : null, d = f ? f.breakAfter : o;
  if (!(e == i && c && !o && !d && s.length < 2 && c.merge(t, n, s.length ? f : null, t == 0, l, a))) {
    if (i < h.length) {
      let O = h[i];
      O && (n < O.length || O.breakAfter && (f != null && f.breakAfter)) ? (e == i && (O = O.split(n), n = 0), !d && f && O.merge(0, n, f, !0, 0, a) ? s[s.length - 1] = O : ((n || O.children.length && !O.children[0].length) && O.merge(0, n, null, !1, 0, a), s.push(O))) : O != null && O.breakAfter && (f ? f.breakAfter = 1 : o = 1), i++;
    }
    for (c && (c.breakAfter = o, t > 0 && (!o && s.length && c.merge(t, c.length, s[0], !1, l, 0) ? c.breakAfter = s.shift().breakAfter : (t < c.length || c.children.length && c.children[c.children.length - 1].length == 0) && c.merge(t, c.length, null, !1, l, 0), e++)); e < i && s.length; )
      if (h[i - 1].become(s[s.length - 1]))
        i--, s.pop(), a = s.length ? 0 : l;
      else if (h[e].become(s[0]))
        e++, s.shift(), l = s.length ? 0 : a;
      else
        break;
    !s.length && e && i < h.length && !h[e - 1].breakAfter && h[i].merge(0, 0, h[e - 1], !1, l, a) && e--, (e < i || s.length) && r.replaceChildren(e, i, s);
  }
}
function yf(r, e, t, i, n, s) {
  let o = r.childCursor(), { i: l, off: a } = o.findPos(t, 1), { i: h, off: c } = o.findPos(e, -1), f = e - t;
  for (let d of i)
    f += d.length;
  r.length += f, Sf(r, h, c, l, a, i, 0, n, s);
}
let $e = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, uo = typeof document < "u" ? document : { documentElement: { style: {} } };
const Oo = /* @__PURE__ */ /Edge\/(\d+)/.exec($e.userAgent), xf = /* @__PURE__ */ /MSIE \d/.test($e.userAgent), po = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec($e.userAgent), es = !!(xf || po || Oo), Ea = !es && /* @__PURE__ */ /gecko\/(\d+)/i.test($e.userAgent), gs = !es && /* @__PURE__ */ /Chrome\/(\d+)/.exec($e.userAgent), Wa = "webkitFontSmoothing" in uo.documentElement.style, kf = !es && /* @__PURE__ */ /Apple Computer/.test($e.vendor), Ya = kf && (/* @__PURE__ */ /Mobile\/\w+/.test($e.userAgent) || $e.maxTouchPoints > 2);
var Z = {
  mac: Ya || /* @__PURE__ */ /Mac/.test($e.platform),
  windows: /* @__PURE__ */ /Win/.test($e.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test($e.platform),
  ie: es,
  ie_version: xf ? uo.documentMode || 6 : po ? +po[1] : Oo ? +Oo[1] : 0,
  gecko: Ea,
  gecko_version: Ea ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec($e.userAgent) || [0, 0])[1] : 0,
  chrome: !!gs,
  chrome_version: gs ? +gs[1] : 0,
  ios: Ya,
  android: /* @__PURE__ */ /Android\b/.test($e.userAgent),
  webkit: Wa,
  safari: kf,
  webkit_version: Wa ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec($e.userAgent) || [0, 0])[1] : 0,
  tabSize: uo.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
const qm = 256;
class Fe extends j {
  constructor(e) {
    super(), this.text = e;
  }
  get length() {
    return this.text.length;
  }
  createDOM(e) {
    this.setDOM(e || document.createTextNode(this.text));
  }
  sync(e, t) {
    this.dom || this.createDOM(), this.dom.nodeValue != this.text && (t && t.node == this.dom && (t.written = !0), this.dom.nodeValue = this.text);
  }
  reuseDOM(e) {
    e.nodeType == 3 && this.createDOM(e);
  }
  merge(e, t, i) {
    return this.flags & 8 || i && (!(i instanceof Fe) || this.length - (t - e) + i.length > qm || i.flags & 8) ? !1 : (this.text = this.text.slice(0, e) + (i ? i.text : "") + this.text.slice(t), this.markDirty(), !0);
  }
  split(e) {
    let t = new Fe(this.text.slice(e));
    return this.text = this.text.slice(0, e), this.markDirty(), t.flags |= this.flags & 8, t;
  }
  localPosFromDOM(e, t) {
    return e == this.dom ? t : t ? this.text.length : 0;
  }
  domAtPos(e) {
    return new ge(this.dom, e);
  }
  domBoundsAround(e, t, i) {
    return { from: i, to: i + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
  }
  coordsAt(e, t) {
    return Vm(this.dom, e, t);
  }
}
class bt extends j {
  constructor(e, t = [], i = 0) {
    super(), this.mark = e, this.children = t, this.length = i;
    for (let n of t)
      n.setParent(this);
  }
  setAttrs(e) {
    if (Of(e), this.mark.class && (e.className = this.mark.class), this.mark.attrs)
      for (let t in this.mark.attrs)
        e.setAttribute(t, this.mark.attrs[t]);
    return e;
  }
  canReuseDOM(e) {
    return super.canReuseDOM(e) && !((this.flags | e.flags) & 8);
  }
  reuseDOM(e) {
    e.nodeName == this.mark.tagName.toUpperCase() && (this.setDOM(e), this.flags |= 6);
  }
  sync(e, t) {
    this.dom ? this.flags & 4 && this.setAttrs(this.dom) : this.setDOM(this.setAttrs(document.createElement(this.mark.tagName))), super.sync(e, t);
  }
  merge(e, t, i, n, s, o) {
    return i && (!(i instanceof bt && i.mark.eq(this.mark)) || e && s <= 0 || t < this.length && o <= 0) ? !1 : (yf(this, e, t, i ? i.children.slice() : [], s - 1, o - 1), this.markDirty(), !0);
  }
  split(e) {
    let t = [], i = 0, n = -1, s = 0;
    for (let l of this.children) {
      let a = i + l.length;
      a > e && t.push(i < e ? l.split(e - i) : l), n < 0 && i >= e && (n = s), i = a, s++;
    }
    let o = this.length - e;
    return this.length = e, n > -1 && (this.children.length = n, this.markDirty()), new bt(this.mark, t, o);
  }
  domAtPos(e) {
    return Qf(this, e);
  }
  coordsAt(e, t) {
    return Pf(this, e, t);
  }
}
function Vm(r, e, t) {
  let i = r.nodeValue.length;
  e > i && (e = i);
  let n = e, s = e, o = 0;
  e == 0 && t < 0 || e == i && t >= 0 ? Z.chrome || Z.gecko || (e ? (n--, o = 1) : s < i && (s++, o = -1)) : t < 0 ? n-- : s < i && s++;
  let l = Kt(r, n, s).getClientRects();
  if (!l.length)
    return null;
  let a = l[(o ? o < 0 : t >= 0) ? 0 : l.length - 1];
  return Z.safari && !o && a.width == 0 && (a = Array.prototype.find.call(l, (h) => h.width) || a), o ? hl(a, o < 0) : a || null;
}
class Tt extends j {
  static create(e, t, i) {
    return new Tt(e, t, i);
  }
  constructor(e, t, i) {
    super(), this.widget = e, this.length = t, this.side = i, this.prevWidget = null;
  }
  split(e) {
    let t = Tt.create(this.widget, this.length - e, this.side);
    return this.length -= e, t;
  }
  sync(e) {
    (!this.dom || !this.widget.updateDOM(this.dom, e)) && (this.dom && this.prevWidget && this.prevWidget.destroy(this.dom), this.prevWidget = null, this.setDOM(this.widget.toDOM(e)), this.widget.editable || (this.dom.contentEditable = "false"));
  }
  getSide() {
    return this.side;
  }
  merge(e, t, i, n, s, o) {
    return i && (!(i instanceof Tt) || !this.widget.compare(i.widget) || e > 0 && s <= 0 || t < this.length && o <= 0) ? !1 : (this.length = e + (i ? i.length : 0) + (this.length - t), !0);
  }
  become(e) {
    return e instanceof Tt && e.side == this.side && this.widget.constructor == e.widget.constructor ? (this.widget.compare(e.widget) || this.markDirty(!0), this.dom && !this.prevWidget && (this.prevWidget = this.widget), this.widget = e.widget, this.length = e.length, !0) : !1;
  }
  ignoreMutation() {
    return !0;
  }
  ignoreEvent(e) {
    return this.widget.ignoreEvent(e);
  }
  get overrideDOMText() {
    if (this.length == 0)
      return L.empty;
    let e = this;
    for (; e.parent; )
      e = e.parent;
    let { view: t } = e, i = t && t.state.doc, n = this.posAtStart;
    return i ? i.slice(n, n + this.length) : L.empty;
  }
  domAtPos(e) {
    return (this.length ? e == 0 : this.side > 0) ? ge.before(this.dom) : ge.after(this.dom, e == this.length);
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(e, t) {
    let i = this.widget.coordsAt(this.dom, e, t);
    if (i)
      return i;
    let n = this.dom.getClientRects(), s = null;
    if (!n.length)
      return null;
    let o = this.side ? this.side < 0 : e > 0;
    for (let l = o ? n.length - 1 : 0; s = n[l], !(e > 0 ? l == 0 : l == n.length - 1 || s.top < s.bottom); l += o ? -1 : 1)
      ;
    return hl(s, !o);
  }
  get isEditable() {
    return !1;
  }
  get isWidget() {
    return !0;
  }
  get isHidden() {
    return this.widget.isHidden;
  }
  destroy() {
    super.destroy(), this.dom && this.widget.destroy(this.dom);
  }
}
class yi extends j {
  constructor(e) {
    super(), this.side = e;
  }
  get length() {
    return 0;
  }
  merge() {
    return !1;
  }
  become(e) {
    return e instanceof yi && e.side == this.side;
  }
  split() {
    return new yi(this.side);
  }
  sync() {
    if (!this.dom) {
      let e = document.createElement("img");
      e.className = "cm-widgetBuffer", e.setAttribute("aria-hidden", "true"), this.setDOM(e);
    }
  }
  getSide() {
    return this.side;
  }
  domAtPos(e) {
    return this.side > 0 ? ge.before(this.dom) : ge.after(this.dom);
  }
  localPosFromDOM() {
    return 0;
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(e) {
    return this.dom.getBoundingClientRect();
  }
  get overrideDOMText() {
    return L.empty;
  }
  get isHidden() {
    return !0;
  }
}
Fe.prototype.children = Tt.prototype.children = yi.prototype.children = cl;
function Qf(r, e) {
  let t = r.dom, { children: i } = r, n = 0;
  for (let s = 0; n < i.length; n++) {
    let o = i[n], l = s + o.length;
    if (!(l == s && o.getSide() <= 0)) {
      if (e > s && e < l && o.dom.parentNode == t)
        return o.domAtPos(e - s);
      if (e <= s)
        break;
      s = l;
    }
  }
  for (let s = n; s > 0; s--) {
    let o = i[s - 1];
    if (o.dom.parentNode == t)
      return o.domAtPos(o.length);
  }
  for (let s = n; s < i.length; s++) {
    let o = i[s];
    if (o.dom.parentNode == t)
      return o.domAtPos(0);
  }
  return new ge(t, 0);
}
function wf(r, e, t) {
  let i, { children: n } = r;
  t > 0 && e instanceof bt && n.length && (i = n[n.length - 1]) instanceof bt && i.mark.eq(e.mark) ? wf(i, e.children[0], t - 1) : (n.push(e), e.setParent(r)), r.length += e.length;
}
function Pf(r, e, t) {
  let i = null, n = -1, s = null, o = -1;
  function l(h, c) {
    for (let f = 0, d = 0; f < h.children.length && d <= c; f++) {
      let O = h.children[f], p = d + O.length;
      p >= c && (O.children.length ? l(O, c - d) : (!s || s.isHidden && t > 0) && (p > c || d == p && O.getSide() > 0) ? (s = O, o = c - d) : (d < c || d == p && O.getSide() < 0 && !O.isHidden) && (i = O, n = c - d)), d = p;
    }
  }
  l(r, e);
  let a = (t < 0 ? i : s) || i || s;
  return a ? a.coordsAt(Math.max(0, a == i ? n : o), t) : Bm(r);
}
function Bm(r) {
  let e = r.dom.lastChild;
  if (!e)
    return r.dom.getBoundingClientRect();
  let t = cr(e);
  return t[t.length - 1] || null;
}
function mo(r, e) {
  for (let t in r)
    t == "class" && e.class ? e.class += " " + r.class : t == "style" && e.style ? e.style += ";" + r.style : e[t] = r[t];
  return e;
}
const Da = /* @__PURE__ */ Object.create(null);
function Mn(r, e, t) {
  if (r == e)
    return !0;
  r || (r = Da), e || (e = Da);
  let i = Object.keys(r), n = Object.keys(e);
  if (i.length - (t && i.indexOf(t) > -1 ? 1 : 0) != n.length - (t && n.indexOf(t) > -1 ? 1 : 0))
    return !1;
  for (let s of i)
    if (s != t && (n.indexOf(s) == -1 || r[s] !== e[s]))
      return !1;
  return !0;
}
function go(r, e, t) {
  let i = !1;
  if (e)
    for (let n in e)
      t && n in t || (i = !0, n == "style" ? r.style.cssText = "" : r.removeAttribute(n));
  if (t)
    for (let n in t)
      e && e[n] == t[n] || (i = !0, n == "style" ? r.style.cssText = t[n] : r.setAttribute(n, t[n]));
  return i;
}
function zm(r) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < r.attributes.length; t++) {
    let i = r.attributes[t];
    e[i.name] = i.value;
  }
  return e;
}
class re extends j {
  constructor() {
    super(...arguments), this.children = [], this.length = 0, this.prevAttrs = void 0, this.attrs = null, this.breakAfter = 0;
  }
  // Consumes source
  merge(e, t, i, n, s, o) {
    if (i) {
      if (!(i instanceof re))
        return !1;
      this.dom || i.transferDOM(this);
    }
    return n && this.setDeco(i ? i.attrs : null), yf(this, e, t, i ? i.children.slice() : [], s, o), !0;
  }
  split(e) {
    let t = new re();
    if (t.breakAfter = this.breakAfter, this.length == 0)
      return t;
    let { i, off: n } = this.childPos(e);
    n && (t.append(this.children[i].split(n), 0), this.children[i].merge(n, this.children[i].length, null, !1, 0, 0), i++);
    for (let s = i; s < this.children.length; s++)
      t.append(this.children[s], 0);
    for (; i > 0 && this.children[i - 1].length == 0; )
      this.children[--i].destroy();
    return this.children.length = i, this.markDirty(), this.length = e, t;
  }
  transferDOM(e) {
    this.dom && (this.markDirty(), e.setDOM(this.dom), e.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs, this.prevAttrs = void 0, this.dom = null);
  }
  setDeco(e) {
    Mn(this.attrs, e) || (this.dom && (this.prevAttrs = this.attrs, this.markDirty()), this.attrs = e);
  }
  append(e, t) {
    wf(this, e, t);
  }
  // Only called when building a line view in ContentBuilder
  addLineDeco(e) {
    let t = e.spec.attributes, i = e.spec.class;
    t && (this.attrs = mo(t, this.attrs || {})), i && (this.attrs = mo({ class: i }, this.attrs || {}));
  }
  domAtPos(e) {
    return Qf(this, e);
  }
  reuseDOM(e) {
    e.nodeName == "DIV" && (this.setDOM(e), this.flags |= 6);
  }
  sync(e, t) {
    var i;
    this.dom ? this.flags & 4 && (Of(this.dom), this.dom.className = "cm-line", this.prevAttrs = this.attrs ? null : void 0) : (this.setDOM(document.createElement("div")), this.dom.className = "cm-line", this.prevAttrs = this.attrs ? null : void 0), this.prevAttrs !== void 0 && (go(this.dom, this.prevAttrs, this.attrs), this.dom.classList.add("cm-line"), this.prevAttrs = void 0), super.sync(e, t);
    let n = this.dom.lastChild;
    for (; n && j.get(n) instanceof bt; )
      n = n.lastChild;
    if (!n || !this.length || n.nodeName != "BR" && ((i = j.get(n)) === null || i === void 0 ? void 0 : i.isEditable) == !1 && (!Z.ios || !this.children.some((s) => s instanceof Fe))) {
      let s = document.createElement("BR");
      s.cmIgnore = !0, this.dom.appendChild(s);
    }
  }
  measureTextSize() {
    if (this.children.length == 0 || this.length > 20)
      return null;
    let e = 0, t;
    for (let i of this.children) {
      if (!(i instanceof Fe) || /[^ -~]/.test(i.text))
        return null;
      let n = cr(i.dom);
      if (n.length != 1)
        return null;
      e += n[0].width, t = n[0].height;
    }
    return e ? {
      lineHeight: this.dom.getBoundingClientRect().height,
      charWidth: e / this.length,
      textHeight: t
    } : null;
  }
  coordsAt(e, t) {
    let i = Pf(this, e, t);
    if (!this.children.length && i && this.parent) {
      let { heightOracle: n } = this.parent.view.viewState, s = i.bottom - i.top;
      if (Math.abs(s - n.lineHeight) < 2 && n.textHeight < s) {
        let o = (s - n.textHeight) / 2;
        return { top: i.top + o, bottom: i.bottom - o, left: i.left, right: i.left };
      }
    }
    return i;
  }
  become(e) {
    return e instanceof re && this.children.length == 0 && e.children.length == 0 && Mn(this.attrs, e.attrs) && this.breakAfter == e.breakAfter;
  }
  covers() {
    return !0;
  }
  static find(e, t) {
    for (let i = 0, n = 0; i < e.children.length; i++) {
      let s = e.children[i], o = n + s.length;
      if (o >= t) {
        if (s instanceof re)
          return s;
        if (o > t)
          break;
      }
      n = o + s.breakAfter;
    }
    return null;
  }
}
class mt extends j {
  constructor(e, t, i) {
    super(), this.widget = e, this.length = t, this.deco = i, this.breakAfter = 0, this.prevWidget = null;
  }
  merge(e, t, i, n, s, o) {
    return i && (!(i instanceof mt) || !this.widget.compare(i.widget) || e > 0 && s <= 0 || t < this.length && o <= 0) ? !1 : (this.length = e + (i ? i.length : 0) + (this.length - t), !0);
  }
  domAtPos(e) {
    return e == 0 ? ge.before(this.dom) : ge.after(this.dom, e == this.length);
  }
  split(e) {
    let t = this.length - e;
    this.length = e;
    let i = new mt(this.widget, t, this.deco);
    return i.breakAfter = this.breakAfter, i;
  }
  get children() {
    return cl;
  }
  sync(e) {
    (!this.dom || !this.widget.updateDOM(this.dom, e)) && (this.dom && this.prevWidget && this.prevWidget.destroy(this.dom), this.prevWidget = null, this.setDOM(this.widget.toDOM(e)), this.widget.editable || (this.dom.contentEditable = "false"));
  }
  get overrideDOMText() {
    return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : L.empty;
  }
  domBoundsAround() {
    return null;
  }
  become(e) {
    return e instanceof mt && e.widget.constructor == this.widget.constructor ? (e.widget.compare(this.widget) || this.markDirty(!0), this.dom && !this.prevWidget && (this.prevWidget = this.widget), this.widget = e.widget, this.length = e.length, this.deco = e.deco, this.breakAfter = e.breakAfter, !0) : !1;
  }
  ignoreMutation() {
    return !0;
  }
  ignoreEvent(e) {
    return this.widget.ignoreEvent(e);
  }
  get isEditable() {
    return !1;
  }
  get isWidget() {
    return !0;
  }
  coordsAt(e, t) {
    return this.widget.coordsAt(this.dom, e, t);
  }
  destroy() {
    super.destroy(), this.dom && this.widget.destroy(this.dom);
  }
  covers(e) {
    let { startSide: t, endSide: i } = this.deco;
    return t == i ? !1 : e < 0 ? t < 0 : i > 0;
  }
}
class Qt {
  /**
  Compare this instance to another instance of the same type.
  (TypeScript can't express this, but only instances of the same
  specific class will be passed to this method.) This is used to
  avoid redrawing widgets when they are replaced by a new
  decoration of the same type. The default implementation just
  returns `false`, which will cause new instances of the widget to
  always be redrawn.
  */
  eq(e) {
    return !1;
  }
  /**
  Update a DOM element created by a widget of the same type (but
  different, non-`eq` content) to reflect this widget. May return
  true to indicate that it could update, false to indicate it
  couldn't (in which case the widget will be redrawn). The default
  implementation just returns false.
  */
  updateDOM(e, t) {
    return !1;
  }
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  The estimated height this widget will have, to be used when
  estimating the height of content that hasn't been drawn. May
  return -1 to indicate you don't know. The default implementation
  returns -1.
  */
  get estimatedHeight() {
    return -1;
  }
  /**
  For inline widgets that are displayed inline (as opposed to
  `inline-block`) and introduce line breaks (through `<br>` tags
  or textual newlines), this must indicate the amount of line
  breaks they introduce. Defaults to 0.
  */
  get lineBreaks() {
    return 0;
  }
  /**
  Can be used to configure which kinds of events inside the widget
  should be ignored by the editor. The default is to ignore all
  events.
  */
  ignoreEvent(e) {
    return !0;
  }
  /**
  Override the way screen coordinates for positions at/in the
  widget are found. `pos` will be the offset into the widget, and
  `side` the side of the position that is being queried—less than
  zero for before, greater than zero for after, and zero for
  directly at that position.
  */
  coordsAt(e, t, i) {
    return null;
  }
  /**
  @internal
  */
  get isHidden() {
    return !1;
  }
  /**
  @internal
  */
  get editable() {
    return !1;
  }
  /**
  This is called when the an instance of the widget is removed
  from the editor view.
  */
  destroy(e) {
  }
}
var xe = /* @__PURE__ */ function(r) {
  return r[r.Text = 0] = "Text", r[r.WidgetBefore = 1] = "WidgetBefore", r[r.WidgetAfter = 2] = "WidgetAfter", r[r.WidgetRange = 3] = "WidgetRange", r;
}(xe || (xe = {}));
class R extends Ft {
  constructor(e, t, i, n) {
    super(), this.startSide = e, this.endSide = t, this.widget = i, this.spec = n;
  }
  /**
  @internal
  */
  get heightRelevant() {
    return !1;
  }
  /**
  Create a mark decoration, which influences the styling of the
  content in its range. Nested mark decorations will cause nested
  DOM elements to be created. Nesting order is determined by
  precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
  the higher-precedence decorations creating the inner DOM nodes.
  Such elements are split on line boundaries and on the boundaries
  of lower-precedence decorations.
  */
  static mark(e) {
    return new Cr(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), i = !!e.block;
    return t += i && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new Dt(e, t, t, i, e.widget || null, !1);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(e) {
    let t = !!e.block, i, n;
    if (e.isBlockGap)
      i = -5e8, n = 4e8;
    else {
      let { start: s, end: o } = $f(e, t);
      i = (s ? t ? -3e8 : -1 : 5e8) - 1, n = (o ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Dt(e, i, n, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new Zr(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return z.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
R.none = z.empty;
class Cr extends R {
  constructor(e) {
    let { start: t, end: i } = $f(e);
    super(t ? -1 : 5e8, i ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.class = e.class || "", this.attrs = e.attributes || null;
  }
  eq(e) {
    var t, i;
    return this == e || e instanceof Cr && this.tagName == e.tagName && (this.class || ((t = this.attrs) === null || t === void 0 ? void 0 : t.class)) == (e.class || ((i = e.attrs) === null || i === void 0 ? void 0 : i.class)) && Mn(this.attrs, e.attrs, "class");
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
Cr.prototype.point = !1;
class Zr extends R {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof Zr && this.spec.class == e.spec.class && Mn(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
Zr.prototype.mapMode = de.TrackBefore;
Zr.prototype.point = !0;
class Dt extends R {
  constructor(e, t, i, n, s, o) {
    super(t, i, s, e), this.block = n, this.isReplace = o, this.mapMode = n ? t <= 0 ? de.TrackBefore : de.TrackAfter : de.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? xe.WidgetRange : this.startSide <= 0 ? xe.WidgetBefore : xe.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof Dt && Lm(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
Dt.prototype.point = !0;
function $f(r, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: i } = r;
  return t == null && (t = r.inclusive), i == null && (i = r.inclusive), { start: t ?? e, end: i ?? e };
}
function Lm(r, e) {
  return r == e || !!(r && e && r.compare(e));
}
function bo(r, e, t, i = 0) {
  let n = t.length - 1;
  n >= 0 && t[n] + i >= r ? t[n] = Math.max(t[n], e) : t.push(r, e);
}
class Ki {
  constructor(e, t, i, n) {
    this.doc = e, this.pos = t, this.end = i, this.disallowBlockEffectsFor = n, this.content = [], this.curLine = null, this.breakAtStart = 0, this.pendingBuffer = 0, this.bufferMarks = [], this.atCursorPos = !0, this.openStart = -1, this.openEnd = -1, this.text = "", this.textOff = 0, this.cursor = e.iter(), this.skip = t;
  }
  posCovered() {
    if (this.content.length == 0)
      return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
    let e = this.content[this.content.length - 1];
    return !(e.breakAfter || e instanceof mt && e.deco.endSide < 0);
  }
  getLine() {
    return this.curLine || (this.content.push(this.curLine = new re()), this.atCursorPos = !0), this.curLine;
  }
  flushBuffer(e = this.bufferMarks) {
    this.pendingBuffer && (this.curLine.append(_r(new yi(-1), e), e.length), this.pendingBuffer = 0);
  }
  addBlockWidget(e) {
    this.flushBuffer(), this.curLine = null, this.content.push(e);
  }
  finish(e) {
    this.pendingBuffer && e <= this.bufferMarks.length ? this.flushBuffer() : this.pendingBuffer = 0, !this.posCovered() && !(e && this.content.length && this.content[this.content.length - 1] instanceof mt) && this.getLine();
  }
  buildText(e, t, i) {
    for (; e > 0; ) {
      if (this.textOff == this.text.length) {
        let { value: s, lineBreak: o, done: l } = this.cursor.next(this.skip);
        if (this.skip = 0, l)
          throw new Error("Ran out of text content when drawing inline views");
        if (o) {
          this.posCovered() || this.getLine(), this.content.length ? this.content[this.content.length - 1].breakAfter = 1 : this.breakAtStart = 1, this.flushBuffer(), this.curLine = null, this.atCursorPos = !0, e--;
          continue;
        } else
          this.text = s, this.textOff = 0;
      }
      let n = Math.min(
        this.text.length - this.textOff,
        e,
        512
        /* T.Chunk */
      );
      this.flushBuffer(t.slice(t.length - i)), this.getLine().append(_r(new Fe(this.text.slice(this.textOff, this.textOff + n)), t), i), this.atCursorPos = !0, this.textOff += n, e -= n, i = 0;
    }
  }
  span(e, t, i, n) {
    this.buildText(t - e, i, n), this.pos = t, this.openStart < 0 && (this.openStart = n);
  }
  point(e, t, i, n, s, o) {
    if (this.disallowBlockEffectsFor[o] && i instanceof Dt) {
      if (i.block)
        throw new RangeError("Block decorations may not be specified via plugins");
      if (t > this.doc.lineAt(this.pos).to)
        throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
    }
    let l = t - e;
    if (i instanceof Dt)
      if (i.block)
        i.startSide > 0 && !this.posCovered() && this.getLine(), this.addBlockWidget(new mt(i.widget || xi.block, l, i));
      else {
        let a = Tt.create(i.widget || xi.inline, l, l ? 0 : i.startSide), h = this.atCursorPos && !a.isEditable && s <= n.length && (e < t || i.startSide > 0), c = !a.isEditable && (e < t || s > n.length || i.startSide <= 0), f = this.getLine();
        this.pendingBuffer == 2 && !h && !a.isEditable && (this.pendingBuffer = 0), this.flushBuffer(n), h && (f.append(_r(new yi(1), n), s), s = n.length + Math.max(0, s - n.length)), f.append(_r(a, n), s), this.atCursorPos = c, this.pendingBuffer = c ? e < t || s > n.length ? 1 : 2 : 0, this.pendingBuffer && (this.bufferMarks = n.slice());
      }
    else this.doc.lineAt(this.pos).from == this.pos && this.getLine().addLineDeco(i);
    l && (this.textOff + l <= this.text.length ? this.textOff += l : (this.skip += l - (this.text.length - this.textOff), this.text = "", this.textOff = 0), this.pos = t), this.openStart < 0 && (this.openStart = s);
  }
  static build(e, t, i, n, s) {
    let o = new Ki(e, t, i, s);
    return o.openEnd = z.spans(n, t, i, o), o.openStart < 0 && (o.openStart = o.openEnd), o.finish(o.openEnd), o;
  }
}
function _r(r, e) {
  for (let t of e)
    r = new bt(t, [r], r.length);
  return r;
}
class xi extends Qt {
  constructor(e) {
    super(), this.tag = e;
  }
  eq(e) {
    return e.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(e) {
    return e.nodeName.toLowerCase() == this.tag;
  }
  get isHidden() {
    return !0;
  }
}
xi.inline = /* @__PURE__ */ new xi("span");
xi.block = /* @__PURE__ */ new xi("div");
var J = /* @__PURE__ */ function(r) {
  return r[r.LTR = 0] = "LTR", r[r.RTL = 1] = "RTL", r;
}(J || (J = {}));
const Jt = J.LTR, fl = J.RTL;
function vf(r) {
  let e = [];
  for (let t = 0; t < r.length; t++)
    e.push(1 << +r[t]);
  return e;
}
const Nm = /* @__PURE__ */ vf("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), _m = /* @__PURE__ */ vf("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), So = /* @__PURE__ */ Object.create(null), rt = [];
for (let r of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ r.charCodeAt(0), t = /* @__PURE__ */ r.charCodeAt(1);
  So[e] = t, So[t] = -e;
}
function Cf(r) {
  return r <= 247 ? Nm[r] : 1424 <= r && r <= 1524 ? 2 : 1536 <= r && r <= 1785 ? _m[r - 1536] : 1774 <= r && r <= 2220 ? 4 : 8192 <= r && r <= 8204 ? 256 : 64336 <= r && r <= 65023 ? 4 : 1;
}
const Um = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class At {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? fl : Jt;
  }
  /**
  @internal
  */
  constructor(e, t, i) {
    this.from = e, this.to = t, this.level = i;
  }
  /**
  @internal
  */
  side(e, t) {
    return this.dir == t == e ? this.to : this.from;
  }
  /**
  @internal
  */
  forward(e, t) {
    return e == (this.dir == t);
  }
  /**
  @internal
  */
  static find(e, t, i, n) {
    let s = -1;
    for (let o = 0; o < e.length; o++) {
      let l = e[o];
      if (l.from <= t && l.to >= t) {
        if (l.level == i)
          return o;
        (s < 0 || (n != 0 ? n < 0 ? l.from < t : l.to > t : e[s].level > l.level)) && (s = o);
      }
    }
    if (s < 0)
      throw new RangeError("Index out of range");
    return s;
  }
}
function Zf(r, e) {
  if (r.length != e.length)
    return !1;
  for (let t = 0; t < r.length; t++) {
    let i = r[t], n = e[t];
    if (i.from != n.from || i.to != n.to || i.direction != n.direction || !Zf(i.inner, n.inner))
      return !1;
  }
  return !0;
}
const I = [];
function Im(r, e, t, i, n) {
  for (let s = 0; s <= i.length; s++) {
    let o = s ? i[s - 1].to : e, l = s < i.length ? i[s].from : t, a = s ? 256 : n;
    for (let h = o, c = a, f = a; h < l; h++) {
      let d = Cf(r.charCodeAt(h));
      d == 512 ? d = c : d == 8 && f == 4 && (d = 16), I[h] = d == 4 ? 2 : d, d & 7 && (f = d), c = d;
    }
    for (let h = o, c = a, f = a; h < l; h++) {
      let d = I[h];
      if (d == 128)
        h < l - 1 && c == I[h + 1] && c & 24 ? d = I[h] = c : I[h] = 256;
      else if (d == 64) {
        let O = h + 1;
        for (; O < l && I[O] == 64; )
          O++;
        let p = h && c == 8 || O < t && I[O] == 8 ? f == 1 ? 1 : 8 : 256;
        for (let m = h; m < O; m++)
          I[m] = p;
        h = O - 1;
      } else d == 8 && f == 1 && (I[h] = 1);
      c = d, d & 7 && (f = d);
    }
  }
}
function jm(r, e, t, i, n) {
  let s = n == 1 ? 2 : 1;
  for (let o = 0, l = 0, a = 0; o <= i.length; o++) {
    let h = o ? i[o - 1].to : e, c = o < i.length ? i[o].from : t;
    for (let f = h, d, O, p; f < c; f++)
      if (O = So[d = r.charCodeAt(f)])
        if (O < 0) {
          for (let m = l - 3; m >= 0; m -= 3)
            if (rt[m + 1] == -O) {
              let g = rt[m + 2], b = g & 2 ? n : g & 4 ? g & 1 ? s : n : 0;
              b && (I[f] = I[rt[m]] = b), l = m;
              break;
            }
        } else {
          if (rt.length == 189)
            break;
          rt[l++] = f, rt[l++] = d, rt[l++] = a;
        }
      else if ((p = I[f]) == 2 || p == 1) {
        let m = p == n;
        a = m ? 0 : 1;
        for (let g = l - 3; g >= 0; g -= 3) {
          let b = rt[g + 2];
          if (b & 2)
            break;
          if (m)
            rt[g + 2] |= 2;
          else {
            if (b & 4)
              break;
            rt[g + 2] |= 4;
          }
        }
      }
  }
}
function Gm(r, e, t, i) {
  for (let n = 0, s = i; n <= t.length; n++) {
    let o = n ? t[n - 1].to : r, l = n < t.length ? t[n].from : e;
    for (let a = o; a < l; ) {
      let h = I[a];
      if (h == 256) {
        let c = a + 1;
        for (; ; )
          if (c == l) {
            if (n == t.length)
              break;
            c = t[n++].to, l = n < t.length ? t[n].from : e;
          } else if (I[c] == 256)
            c++;
          else
            break;
        let f = s == 1, d = (c < e ? I[c] : i) == 1, O = f == d ? f ? 1 : 2 : i;
        for (let p = c, m = n, g = m ? t[m - 1].to : r; p > a; )
          p == g && (p = t[--m].from, g = m ? t[m - 1].to : r), I[--p] = O;
        a = c;
      } else
        s = h, a++;
    }
  }
}
function yo(r, e, t, i, n, s, o) {
  let l = i % 2 ? 2 : 1;
  if (i % 2 == n % 2)
    for (let a = e, h = 0; a < t; ) {
      let c = !0, f = !1;
      if (h == s.length || a < s[h].from) {
        let m = I[a];
        m != l && (c = !1, f = m == 16);
      }
      let d = !c && l == 1 ? [] : null, O = c ? i : i + 1, p = a;
      e: for (; ; )
        if (h < s.length && p == s[h].from) {
          if (f)
            break e;
          let m = s[h];
          if (!c)
            for (let g = m.to, b = h + 1; ; ) {
              if (g == t)
                break e;
              if (b < s.length && s[b].from == g)
                g = s[b++].to;
              else {
                if (I[g] == l)
                  break e;
                break;
              }
            }
          if (h++, d)
            d.push(m);
          else {
            m.from > a && o.push(new At(a, m.from, O));
            let g = m.direction == Jt != !(O % 2);
            xo(r, g ? i + 1 : i, n, m.inner, m.from, m.to, o), a = m.to;
          }
          p = m.to;
        } else {
          if (p == t || (c ? I[p] != l : I[p] == l))
            break;
          p++;
        }
      d ? yo(r, a, p, i + 1, n, d, o) : a < p && o.push(new At(a, p, O)), a = p;
    }
  else
    for (let a = t, h = s.length; a > e; ) {
      let c = !0, f = !1;
      if (!h || a > s[h - 1].to) {
        let m = I[a - 1];
        m != l && (c = !1, f = m == 16);
      }
      let d = !c && l == 1 ? [] : null, O = c ? i : i + 1, p = a;
      e: for (; ; )
        if (h && p == s[h - 1].to) {
          if (f)
            break e;
          let m = s[--h];
          if (!c)
            for (let g = m.from, b = h; ; ) {
              if (g == e)
                break e;
              if (b && s[b - 1].to == g)
                g = s[--b].from;
              else {
                if (I[g - 1] == l)
                  break e;
                break;
              }
            }
          if (d)
            d.push(m);
          else {
            m.to < a && o.push(new At(m.to, a, O));
            let g = m.direction == Jt != !(O % 2);
            xo(r, g ? i + 1 : i, n, m.inner, m.from, m.to, o), a = m.from;
          }
          p = m.from;
        } else {
          if (p == e || (c ? I[p - 1] != l : I[p - 1] == l))
            break;
          p--;
        }
      d ? yo(r, p, a, i + 1, n, d, o) : p < a && o.push(new At(p, a, O)), a = p;
    }
}
function xo(r, e, t, i, n, s, o) {
  let l = e % 2 ? 2 : 1;
  Im(r, n, s, i, l), jm(r, n, s, i, l), Gm(n, s, i, l), yo(r, n, s, e, t, i, o);
}
function Fm(r, e, t) {
  if (!r)
    return [new At(0, 0, e == fl ? 1 : 0)];
  if (e == Jt && !t.length && !Um.test(r))
    return Tf(r.length);
  if (t.length)
    for (; r.length > I.length; )
      I[I.length] = 256;
  let i = [], n = e == Jt ? 0 : 1;
  return xo(r, n, n, t, 0, r.length, i), i;
}
function Tf(r) {
  return [new At(0, r, 0)];
}
let Af = "";
function Hm(r, e, t, i, n) {
  var s;
  let o = i.head - r.from, l = At.find(e, o, (s = i.bidiLevel) !== null && s !== void 0 ? s : -1, i.assoc), a = e[l], h = a.side(n, t);
  if (o == h) {
    let d = l += n ? 1 : -1;
    if (d < 0 || d >= e.length)
      return null;
    a = e[l = d], o = a.side(!n, t), h = a.side(n, t);
  }
  let c = pe(r.text, o, a.forward(n, t));
  (c < a.from || c > a.to) && (c = h), Af = r.text.slice(Math.min(o, c), Math.max(o, c));
  let f = l == (n ? e.length - 1 : 0) ? null : e[l + (n ? 1 : -1)];
  return f && c == h && f.level + (n ? 0 : 1) < a.level ? y.cursor(f.side(!n, t) + r.from, f.forward(n, t) ? 1 : -1, f.level) : y.cursor(c + r.from, a.forward(n, t) ? -1 : 1, a.level);
}
function Km(r, e, t) {
  for (let i = e; i < t; i++) {
    let n = Cf(r.charCodeAt(i));
    if (n == 1)
      return Jt;
    if (n == 2 || n == 4)
      return fl;
  }
  return Jt;
}
const Rf = /* @__PURE__ */ T.define(), Xf = /* @__PURE__ */ T.define(), Mf = /* @__PURE__ */ T.define(), Ef = /* @__PURE__ */ T.define(), ko = /* @__PURE__ */ T.define(), Wf = /* @__PURE__ */ T.define(), Yf = /* @__PURE__ */ T.define(), Df = /* @__PURE__ */ T.define({
  combine: (r) => r.some((e) => e)
}), qf = /* @__PURE__ */ T.define({
  combine: (r) => r.some((e) => e)
}), Vf = /* @__PURE__ */ T.define();
class pi {
  constructor(e, t = "nearest", i = "nearest", n = 5, s = 5, o = !1) {
    this.range = e, this.y = t, this.x = i, this.yMargin = n, this.xMargin = s, this.isSnapshot = o;
  }
  map(e) {
    return e.empty ? this : new pi(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new pi(y.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const Ur = /* @__PURE__ */ M.define({ map: (r, e) => r.map(e) }), Bf = /* @__PURE__ */ M.define();
function Ce(r, e, t) {
  let i = r.facet(Ef);
  i.length ? i[0](e) : window.onerror ? window.onerror(String(e), t, void 0, void 0, e) : t ? console.error(t + ":", e) : console.error(e);
}
const vt = /* @__PURE__ */ T.define({ combine: (r) => r.length ? r[0] : !0 });
let Jm = 0;
const Ni = /* @__PURE__ */ T.define();
class se {
  constructor(e, t, i, n, s) {
    this.id = e, this.create = t, this.domEventHandlers = i, this.domEventObservers = n, this.extension = s(this);
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: i, eventObservers: n, provide: s, decorations: o } = t || {};
    return new se(Jm++, e, i, n, (l) => {
      let a = [Ni.of(l)];
      return o && a.push(fr.of((h) => {
        let c = h.plugin(l);
        return c ? o(c) : R.none;
      })), s && a.push(s(l)), a;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(e, t) {
    return se.define((i) => new e(i), t);
  }
}
class bs {
  constructor(e) {
    this.spec = e, this.mustUpdate = null, this.value = null;
  }
  update(e) {
    if (this.value) {
      if (this.mustUpdate) {
        let t = this.mustUpdate;
        if (this.mustUpdate = null, this.value.update)
          try {
            this.value.update(t);
          } catch (i) {
            if (Ce(t.state, i, "CodeMirror plugin crashed"), this.value.destroy)
              try {
                this.value.destroy();
              } catch {
              }
            this.deactivate();
          }
      }
    } else if (this.spec)
      try {
        this.value = this.spec.create(e);
      } catch (t) {
        Ce(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (i) {
        Ce(e.state, i, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const zf = /* @__PURE__ */ T.define(), ul = /* @__PURE__ */ T.define(), fr = /* @__PURE__ */ T.define(), Lf = /* @__PURE__ */ T.define(), dl = /* @__PURE__ */ T.define(), Nf = /* @__PURE__ */ T.define();
function qa(r, e) {
  let t = r.state.facet(Nf);
  if (!t.length)
    return t;
  let i = t.map((s) => s instanceof Function ? s(r) : s), n = [];
  return z.spans(i, e.from, e.to, {
    point() {
    },
    span(s, o, l, a) {
      let h = s - e.from, c = o - e.from, f = n;
      for (let d = l.length - 1; d >= 0; d--, a--) {
        let O = l[d].spec.bidiIsolate, p;
        if (O == null && (O = Km(e.text, h, c)), a > 0 && f.length && (p = f[f.length - 1]).to == h && p.direction == O)
          p.to = c, f = p.inner;
        else {
          let m = { from: h, to: c, direction: O, inner: [] };
          f.push(m), f = m.inner;
        }
      }
    }
  }), n;
}
const _f = /* @__PURE__ */ T.define();
function Uf(r) {
  let e = 0, t = 0, i = 0, n = 0;
  for (let s of r.state.facet(_f)) {
    let o = s(r);
    o && (o.left != null && (e = Math.max(e, o.left)), o.right != null && (t = Math.max(t, o.right)), o.top != null && (i = Math.max(i, o.top)), o.bottom != null && (n = Math.max(n, o.bottom)));
  }
  return { left: e, right: t, top: i, bottom: n };
}
const _i = /* @__PURE__ */ T.define();
class Ne {
  constructor(e, t, i, n) {
    this.fromA = e, this.toA = t, this.fromB = i, this.toB = n;
  }
  join(e) {
    return new Ne(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
  }
  addToSet(e) {
    let t = e.length, i = this;
    for (; t > 0; t--) {
      let n = e[t - 1];
      if (!(n.fromA > i.toA)) {
        if (n.toA < i.fromA)
          break;
        i = i.join(n), e.splice(t - 1, 1);
      }
    }
    return e.splice(t, 0, i), e;
  }
  static extendWithRanges(e, t) {
    if (t.length == 0)
      return e;
    let i = [];
    for (let n = 0, s = 0, o = 0, l = 0; ; n++) {
      let a = n == e.length ? null : e[n], h = o - l, c = a ? a.fromB : 1e9;
      for (; s < t.length && t[s] < c; ) {
        let f = t[s], d = t[s + 1], O = Math.max(l, f), p = Math.min(c, d);
        if (O <= p && new Ne(O + h, p + h, O, p).addToSet(i), d > c)
          break;
        s += 2;
      }
      if (!a)
        return i;
      new Ne(a.fromA, a.toA, a.fromB, a.toB).addToSet(i), o = a.toA, l = a.toB;
    }
  }
}
class En {
  constructor(e, t, i) {
    this.view = e, this.state = t, this.transactions = i, this.flags = 0, this.startState = e.state, this.changes = le.empty(this.startState.doc.length);
    for (let s of i)
      this.changes = this.changes.compose(s.changes);
    let n = [];
    this.changes.iterChangedRanges((s, o, l, a) => n.push(new Ne(s, o, l, a))), this.changedRanges = n;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new En(e, t, i);
  }
  /**
  Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
  [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
  update.
  */
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  /**
  Indicates whether the height of a block element in the editor
  changed in this update.
  */
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  /**
  Returns true when the document was modified or the size of the
  editor, or elements within the editor, changed.
  */
  get geometryChanged() {
    return this.docChanged || (this.flags & 10) > 0;
  }
  /**
  True when this update indicates a focus change.
  */
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  /**
  Whether the document changed in this update.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Whether the selection was explicitly set in this update.
  */
  get selectionSet() {
    return this.transactions.some((e) => e.selection);
  }
  /**
  @internal
  */
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
}
class Va extends j {
  get length() {
    return this.view.state.doc.length;
  }
  constructor(e) {
    super(), this.view = e, this.decorations = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.markedForComposition = /* @__PURE__ */ new Set(), this.editContextFormatting = R.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.setDOM(e.contentDOM), this.children = [new re()], this.children[0].setParent(this), this.updateDeco(), this.updateInner([new Ne(0, 0, 0, e.state.doc.length)], 0, null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let i = e.changedRanges;
    this.minWidth > 0 && i.length && (i.every(({ fromA: h, toA: c }) => c < this.minWidthFrom || h > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let n = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? n = this.domChanged.newSel.head : !og(e.changes, this.hasComposition) && !e.selectionSet && (n = e.state.selection.main.head));
    let s = n > -1 ? tg(this.view, e.changes, n) : null;
    if (this.domChanged = null, this.hasComposition) {
      this.markedForComposition.clear();
      let { from: h, to: c } = this.hasComposition;
      i = new Ne(h, c, e.changes.mapPos(h, -1), e.changes.mapPos(c, 1)).addToSet(i.slice());
    }
    this.hasComposition = s ? { from: s.range.fromB, to: s.range.toB } : null, (Z.ie || Z.chrome) && !s && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let o = this.decorations, l = this.updateDeco(), a = ng(o, l, e.changes);
    return i = Ne.extendWithRanges(i, a), !(this.flags & 7) && i.length == 0 ? !1 : (this.updateInner(i, e.startState.doc.length, s), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t, i) {
    this.view.viewState.mustMeasureContent = !0, this.updateChildren(e, t, i);
    let { observer: n } = this.view;
    n.ignore(() => {
      this.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = Z.chrome || Z.ios ? { node: n.selectionRange.focusNode, written: !1 } : void 0;
      this.sync(this.view, o), this.flags &= -8, o && (o.written || n.selectionRange.focusNode != o.node) && (this.forceSelection = !0), this.dom.style.height = "";
    }), this.markedForComposition.forEach(
      (o) => o.flags &= -9
      /* ViewFlag.Composition */
    );
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.children)
        o instanceof mt && o.widget instanceof Ba && s.push(o.dom);
    n.updateGaps(s);
  }
  updateChildren(e, t, i) {
    let n = i ? i.range.addToSet(e.slice()) : e, s = this.childCursor(t);
    for (let o = n.length - 1; ; o--) {
      let l = o >= 0 ? n[o] : null;
      if (!l)
        break;
      let { fromA: a, toA: h, fromB: c, toB: f } = l, d, O, p, m;
      if (i && i.range.fromB < f && i.range.toB > c) {
        let Q = Ki.build(this.view.state.doc, c, i.range.fromB, this.decorations, this.dynamicDecorationMap), x = Ki.build(this.view.state.doc, i.range.toB, f, this.decorations, this.dynamicDecorationMap);
        O = Q.breakAtStart, p = Q.openStart, m = x.openEnd;
        let v = this.compositionView(i);
        x.breakAtStart ? v.breakAfter = 1 : x.content.length && v.merge(v.length, v.length, x.content[0], !1, x.openStart, 0) && (v.breakAfter = x.content[0].breakAfter, x.content.shift()), Q.content.length && v.merge(0, 0, Q.content[Q.content.length - 1], !0, 0, Q.openEnd) && Q.content.pop(), d = Q.content.concat(v).concat(x.content);
      } else
        ({ content: d, breakAtStart: O, openStart: p, openEnd: m } = Ki.build(this.view.state.doc, c, f, this.decorations, this.dynamicDecorationMap));
      let { i: g, off: b } = s.findPos(h, 1), { i: S, off: k } = s.findPos(a, -1);
      Sf(this, S, k, g, b, d, O, p, m);
    }
    i && this.fixCompositionDOM(i);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let i of t.effects)
        i.is(Bf) && (this.editContextFormatting = i.value);
  }
  compositionView(e) {
    let t = new Fe(e.text.nodeValue);
    t.flags |= 8;
    for (let { deco: n } of e.marks)
      t = new bt(n, [t], t.length);
    let i = new re();
    return i.append(t, 0), i;
  }
  fixCompositionDOM(e) {
    let t = (s, o) => {
      o.flags |= 8 | (o.children.some(
        (a) => a.flags & 7
        /* ViewFlag.Dirty */
      ) ? 1 : 0), this.markedForComposition.add(o);
      let l = j.get(s);
      l && l != o && (l.dom = null), o.setDOM(s);
    }, i = this.childPos(e.range.fromB, 1), n = this.children[i.i];
    t(e.line, n);
    for (let s = e.marks.length - 1; s >= -1; s--)
      i = n.childPos(i.off, 1), n = n.children[i.i], t(s >= 0 ? e.marks[s].node : e.text, n);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let i = this.view.root.activeElement, n = i == this.dom, s = !n && mn(this.dom, this.view.observer.selectionRange) && !(i && this.dom.contains(i));
    if (!(n || t || s))
      return;
    let o = this.forceSelection;
    this.forceSelection = !1;
    let l = this.view.state.selection.main, a = this.moveToLine(this.domAtPos(l.anchor)), h = l.empty ? a : this.moveToLine(this.domAtPos(l.head));
    if (Z.gecko && l.empty && !this.hasComposition && eg(a)) {
      let f = document.createTextNode("");
      this.view.observer.ignore(() => a.node.insertBefore(f, a.node.childNodes[a.offset] || null)), a = h = new ge(f, 0), o = !0;
    }
    let c = this.view.observer.selectionRange;
    (o || !c.focusNode || (!Hi(a.node, a.offset, c.anchorNode, c.anchorOffset) || !Hi(h.node, h.offset, c.focusNode, c.focusOffset)) && !this.suppressWidgetCursorChange(c, l)) && (this.view.observer.ignore(() => {
      Z.android && Z.chrome && this.dom.contains(c.focusNode) && sg(c.focusNode, this.dom) && (this.dom.blur(), this.dom.focus({ preventScroll: !0 }));
      let f = hr(this.view.root);
      if (f) if (l.empty) {
        if (Z.gecko) {
          let d = ig(a.node, a.offset);
          if (d && d != 3) {
            let O = (d == 1 ? mf : gf)(a.node, a.offset);
            O && (a = new ge(O.node, O.offset));
          }
        }
        f.collapse(a.node, a.offset), l.bidiLevel != null && f.caretBidiLevel !== void 0 && (f.caretBidiLevel = l.bidiLevel);
      } else if (f.extend) {
        f.collapse(a.node, a.offset);
        try {
          f.extend(h.node, h.offset);
        } catch {
        }
      } else {
        let d = document.createRange();
        l.anchor > l.head && ([a, h] = [h, a]), d.setEnd(h.node, h.offset), d.setStart(a.node, a.offset), f.removeAllRanges(), f.addRange(d);
      }
      s && this.view.root.activeElement == this.dom && (this.dom.blur(), i && i.focus());
    }), this.view.observer.setSelectionRange(a, h)), this.impreciseAnchor = a.precise ? null : new ge(c.anchorNode, c.anchorOffset), this.impreciseHead = h.precise ? null : new ge(c.focusNode, c.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Hi(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, i = hr(e.root), { anchorNode: n, anchorOffset: s } = e.observer.selectionRange;
    if (!i || !t.empty || !t.assoc || !i.modify)
      return;
    let o = re.find(this, t.head);
    if (!o)
      return;
    let l = o.posAtStart;
    if (t.head == l || t.head == l + o.length)
      return;
    let a = this.coordsAt(t.head, -1), h = this.coordsAt(t.head, 1);
    if (!a || !h || a.bottom > h.top)
      return;
    let c = this.domAtPos(t.head + t.assoc);
    i.collapse(c.node, c.offset), i.modify("move", t.assoc < 0 ? "forward" : "backward", "lineboundary"), e.observer.readSelectionRange();
    let f = e.observer.selectionRange;
    e.docView.posFromDOM(f.anchorNode, f.anchorOffset) != t.from && i.collapse(n, s);
  }
  // If a position is in/near a block widget, move it to a nearby text
  // line, since we don't want the cursor inside a block widget.
  moveToLine(e) {
    let t = this.dom, i;
    if (e.node != t)
      return e;
    for (let n = e.offset; !i && n < t.childNodes.length; n++) {
      let s = j.get(t.childNodes[n]);
      s instanceof re && (i = s.domAtPos(0));
    }
    for (let n = e.offset - 1; !i && n >= 0; n--) {
      let s = j.get(t.childNodes[n]);
      s instanceof re && (i = s.domAtPos(s.length));
    }
    return i ? new ge(i.node, i.offset, !0) : e;
  }
  nearest(e) {
    for (let t = e; t; ) {
      let i = j.get(t);
      if (i && i.rootView == this)
        return i;
      t = t.parentNode;
    }
    return null;
  }
  posFromDOM(e, t) {
    let i = this.nearest(e);
    if (!i)
      throw new RangeError("Trying to find position for a DOM position outside of the document");
    return i.localPosFromDOM(e, t) + i.posAtStart;
  }
  domAtPos(e) {
    let { i: t, off: i } = this.childCursor().findPos(e, -1);
    for (; t < this.children.length - 1; ) {
      let n = this.children[t];
      if (i < n.length || n instanceof re)
        break;
      t++, i = 0;
    }
    return this.children[t].domAtPos(i);
  }
  coordsAt(e, t) {
    let i = null, n = 0;
    for (let s = this.length, o = this.children.length - 1; o >= 0; o--) {
      let l = this.children[o], a = s - l.breakAfter, h = a - l.length;
      if (a < e)
        break;
      if (h <= e && (h < e || l.covers(-1)) && (a > e || l.covers(1)) && (!i || l instanceof re && !(i instanceof re && t >= 0)))
        i = l, n = h;
      else if (i && h == e && a == e && l instanceof mt && Math.abs(t) < 2) {
        if (l.deco.startSide < 0)
          break;
        o && (i = null);
      }
      s = h;
    }
    return i ? i.coordsAt(e - n, t) : null;
  }
  coordsForChar(e) {
    let { i: t, off: i } = this.childPos(e, 1), n = this.children[t];
    if (!(n instanceof re))
      return null;
    for (; n.children.length; ) {
      let { i: l, off: a } = n.childPos(i, 1);
      for (; ; l++) {
        if (l == n.children.length)
          return null;
        if ((n = n.children[l]).length)
          break;
      }
      i = a;
    }
    if (!(n instanceof Fe))
      return null;
    let s = pe(n.text, i);
    if (s == i)
      return null;
    let o = Kt(n.dom, i, s).getClientRects();
    for (let l = 0; l < o.length; l++) {
      let a = o[l];
      if (l == o.length - 1 || a.top < a.bottom && a.left < a.right)
        return a;
    }
    return null;
  }
  measureVisibleLineHeights(e) {
    let t = [], { from: i, to: n } = e, s = this.view.contentDOM.clientWidth, o = s > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == J.LTR;
    for (let h = 0, c = 0; c < this.children.length; c++) {
      let f = this.children[c], d = h + f.length;
      if (d > n)
        break;
      if (h >= i) {
        let O = f.dom.getBoundingClientRect();
        if (t.push(O.height), o) {
          let p = f.dom.lastChild, m = p ? cr(p) : [];
          if (m.length) {
            let g = m[m.length - 1], b = a ? g.right - O.left : O.right - g.left;
            b > l && (l = b, this.minWidth = s, this.minWidthFrom = h, this.minWidthTo = d);
          }
        }
      }
      h = d + f.breakAfter;
    }
    return t;
  }
  textDirectionAt(e) {
    let { i: t } = this.childPos(e, 1);
    return getComputedStyle(this.children[t].dom).direction == "rtl" ? J.RTL : J.LTR;
  }
  measureTextSize() {
    for (let s of this.children)
      if (s instanceof re) {
        let o = s.measureTextSize();
        if (o)
          return o;
      }
    let e = document.createElement("div"), t, i, n;
    return e.className = "cm-line", e.style.width = "99999px", e.style.position = "absolute", e.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.dom.appendChild(e);
      let s = cr(e.firstChild)[0];
      t = e.getBoundingClientRect().height, i = s ? s.width / 27 : 7, n = s ? s.height : t, e.remove();
    }), { lineHeight: t, charWidth: i, textHeight: n };
  }
  childCursor(e = this.length) {
    let t = this.children.length;
    return t && (e -= this.children[--t].length), new bf(this.children, e, t);
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let i = 0, n = 0; ; n++) {
      let s = n == t.viewports.length ? null : t.viewports[n], o = s ? s.from - 1 : this.length;
      if (o > i) {
        let l = (t.lineBlockAt(o).bottom - t.lineBlockAt(i).top) / this.view.scaleY;
        e.push(R.replace({
          widget: new Ba(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(i, o));
      }
      if (!s)
        break;
      i = s.to + 1;
    }
    return R.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(fr).map((s) => (this.dynamicDecorationMap[e++] = typeof s == "function") ? s(this.view) : s), i = !1, n = this.view.state.facet(Lf).map((s, o) => {
      let l = typeof s == "function";
      return l && (i = !0), l ? s(this.view) : s;
    });
    for (n.length && (this.dynamicDecorationMap[e++] = i, t.push(z.join(n))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    return this.decorations;
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let h = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = h.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let h of this.view.state.facet(Vf))
      try {
        if (h(this.view, e.range, e))
          return !0;
      } catch (c) {
        Ce(this.view.state, c, "scroll handler");
      }
    let { range: t } = e, i = this.coordsAt(t.head, t.empty ? t.assoc : t.head > t.anchor ? -1 : 1), n;
    if (!i)
      return;
    !t.empty && (n = this.coordsAt(t.anchor, t.anchor > t.head ? -1 : 1)) && (i = {
      left: Math.min(i.left, n.left),
      top: Math.min(i.top, n.top),
      right: Math.max(i.right, n.right),
      bottom: Math.max(i.bottom, n.bottom)
    });
    let s = Uf(this.view), o = {
      left: i.left - s.left,
      top: i.top - s.top,
      right: i.right + s.right,
      bottom: i.bottom + s.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    Mm(this.view.scrollDOM, o, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, a), -a), this.view.textDirection == J.LTR);
  }
}
function eg(r) {
  return r.node.nodeType == 1 && r.node.firstChild && (r.offset == 0 || r.node.childNodes[r.offset - 1].contentEditable == "false") && (r.offset == r.node.childNodes.length || r.node.childNodes[r.offset].contentEditable == "false");
}
class Ba extends Qt {
  constructor(e) {
    super(), this.height = e;
  }
  toDOM() {
    let e = document.createElement("div");
    return e.className = "cm-gap", this.updateDOM(e), e;
  }
  eq(e) {
    return e.height == this.height;
  }
  updateDOM(e) {
    return e.style.height = this.height + "px", !0;
  }
  get editable() {
    return !0;
  }
  get estimatedHeight() {
    return this.height;
  }
  ignoreEvent() {
    return !1;
  }
}
function If(r, e) {
  let t = r.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let i = mf(t.focusNode, t.focusOffset), n = gf(t.focusNode, t.focusOffset), s = i || n;
  if (n && i && n.node != i.node) {
    let l = j.get(n.node);
    if (!l || l instanceof Fe && l.text != n.node.nodeValue)
      s = n;
    else if (r.docView.lastCompositionAfterCursor) {
      let a = j.get(i.node);
      !a || a instanceof Fe && a.text != i.node.nodeValue || (s = n);
    }
  }
  if (r.docView.lastCompositionAfterCursor = s != i, !s)
    return null;
  let o = e - s.offset;
  return { from: o, to: o + s.node.nodeValue.length, node: s.node };
}
function tg(r, e, t) {
  let i = If(r, t);
  if (!i)
    return null;
  let { node: n, from: s, to: o } = i, l = n.nodeValue;
  if (/[\n\r]/.test(l) || r.state.doc.sliceString(i.from, i.to) != l)
    return null;
  let a = e.invertedDesc, h = new Ne(a.mapPos(s), a.mapPos(o), s, o), c = [];
  for (let f = n.parentNode; ; f = f.parentNode) {
    let d = j.get(f);
    if (d instanceof bt)
      c.push({ node: f, deco: d.mark });
    else {
      if (d instanceof re || f.nodeName == "DIV" && f.parentNode == r.contentDOM)
        return { range: h, text: n, marks: c, line: f };
      if (f != r.contentDOM)
        c.push({ node: f, deco: new Cr({
          inclusive: !0,
          attributes: zm(f),
          tagName: f.tagName.toLowerCase()
        }) });
      else
        return null;
    }
  }
}
function ig(r, e) {
  return r.nodeType != 1 ? 0 : (e && r.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < r.childNodes.length && r.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let rg = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    bo(e, t, this.changes);
  }
  comparePoint(e, t) {
    bo(e, t, this.changes);
  }
};
function ng(r, e, t) {
  let i = new rg();
  return z.compare(r, e, t, i), i.changes;
}
function sg(r, e) {
  for (let t = r; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function og(r, e) {
  let t = !1;
  return e && r.iterChangedRanges((i, n) => {
    i < e.to && n > e.from && (t = !0);
  }), t;
}
function lg(r, e, t = 1) {
  let i = r.charCategorizer(e), n = r.doc.lineAt(e), s = e - n.from;
  if (n.length == 0)
    return y.cursor(e);
  s == 0 ? t = 1 : s == n.length && (t = -1);
  let o = s, l = s;
  t < 0 ? o = pe(n.text, s, !1) : l = pe(n.text, s);
  let a = i(n.text.slice(o, l));
  for (; o > 0; ) {
    let h = pe(n.text, o, !1);
    if (i(n.text.slice(h, o)) != a)
      break;
    o = h;
  }
  for (; l < n.length; ) {
    let h = pe(n.text, l);
    if (i(n.text.slice(l, h)) != a)
      break;
    l = h;
  }
  return y.range(o + n.from, l + n.from);
}
function ag(r, e) {
  return e.left > r ? e.left - r : Math.max(0, r - e.right);
}
function hg(r, e) {
  return e.top > r ? e.top - r : Math.max(0, r - e.bottom);
}
function Ss(r, e) {
  return r.top < e.bottom - 1 && r.bottom > e.top + 1;
}
function za(r, e) {
  return e < r.top ? { top: e, left: r.left, right: r.right, bottom: r.bottom } : r;
}
function La(r, e) {
  return e > r.bottom ? { top: r.top, left: r.left, right: r.right, bottom: e } : r;
}
function Qo(r, e, t) {
  let i, n, s, o, l = !1, a, h, c, f;
  for (let p = r.firstChild; p; p = p.nextSibling) {
    let m = cr(p);
    for (let g = 0; g < m.length; g++) {
      let b = m[g];
      n && Ss(n, b) && (b = za(La(b, n.bottom), n.top));
      let S = ag(e, b), k = hg(t, b);
      if (S == 0 && k == 0)
        return p.nodeType == 3 ? Na(p, e, t) : Qo(p, e, t);
      if (!i || o > k || o == k && s > S) {
        i = p, n = b, s = S, o = k;
        let Q = k ? t < b.top ? -1 : 1 : S ? e < b.left ? -1 : 1 : 0;
        l = !Q || (Q > 0 ? g < m.length - 1 : g > 0);
      }
      S == 0 ? t > b.bottom && (!c || c.bottom < b.bottom) ? (a = p, c = b) : t < b.top && (!f || f.top > b.top) && (h = p, f = b) : c && Ss(c, b) ? c = La(c, b.bottom) : f && Ss(f, b) && (f = za(f, b.top));
    }
  }
  if (c && c.bottom >= t ? (i = a, n = c) : f && f.top <= t && (i = h, n = f), !i)
    return { node: r, offset: 0 };
  let d = Math.max(n.left, Math.min(n.right, e));
  if (i.nodeType == 3)
    return Na(i, d, t);
  if (l && i.contentEditable != "false")
    return Qo(i, d, t);
  let O = Array.prototype.indexOf.call(r.childNodes, i) + (e >= (n.left + n.right) / 2 ? 1 : 0);
  return { node: r, offset: O };
}
function Na(r, e, t) {
  let i = r.nodeValue.length, n = -1, s = 1e9, o = 0;
  for (let l = 0; l < i; l++) {
    let a = Kt(r, l, l + 1).getClientRects();
    for (let h = 0; h < a.length; h++) {
      let c = a[h];
      if (c.top == c.bottom)
        continue;
      o || (o = e - c.left);
      let f = (c.top > t ? c.top - t : t - c.bottom) - 1;
      if (c.left - 1 <= e && c.right + 1 >= e && f < s) {
        let d = e >= (c.left + c.right) / 2, O = d;
        if ((Z.chrome || Z.gecko) && Kt(r, l).getBoundingClientRect().left == c.right && (O = !d), f <= 0)
          return { node: r, offset: l + (O ? 1 : 0) };
        n = l + (O ? 1 : 0), s = f;
      }
    }
  }
  return { node: r, offset: n > -1 ? n : o > 0 ? r.nodeValue.length : 0 };
}
function jf(r, e, t, i = -1) {
  var n, s;
  let o = r.contentDOM.getBoundingClientRect(), l = o.top + r.viewState.paddingTop, a, { docHeight: h } = r.viewState, { x: c, y: f } = e, d = f - l;
  if (d < 0)
    return 0;
  if (d > h)
    return r.state.doc.length;
  for (let Q = r.viewState.heightOracle.textHeight / 2, x = !1; a = r.elementAtHeight(d), a.type != xe.Text; )
    for (; d = i > 0 ? a.bottom + Q : a.top - Q, !(d >= 0 && d <= h); ) {
      if (x)
        return t ? null : 0;
      x = !0, i = -i;
    }
  f = l + d;
  let O = a.from;
  if (O < r.viewport.from)
    return r.viewport.from == 0 ? 0 : t ? null : _a(r, o, a, c, f);
  if (O > r.viewport.to)
    return r.viewport.to == r.state.doc.length ? r.state.doc.length : t ? null : _a(r, o, a, c, f);
  let p = r.dom.ownerDocument, m = r.root.elementFromPoint ? r.root : p, g = m.elementFromPoint(c, f);
  g && !r.contentDOM.contains(g) && (g = null), g || (c = Math.max(o.left + 1, Math.min(o.right - 1, c)), g = m.elementFromPoint(c, f), g && !r.contentDOM.contains(g) && (g = null));
  let b, S = -1;
  if (g && ((n = r.docView.nearest(g)) === null || n === void 0 ? void 0 : n.isEditable) != !1) {
    if (p.caretPositionFromPoint) {
      let Q = p.caretPositionFromPoint(c, f);
      Q && ({ offsetNode: b, offset: S } = Q);
    } else if (p.caretRangeFromPoint) {
      let Q = p.caretRangeFromPoint(c, f);
      Q && ({ startContainer: b, startOffset: S } = Q, (!r.contentDOM.contains(b) || Z.safari && cg(b, S, c) || Z.chrome && fg(b, S, c)) && (b = void 0));
    }
  }
  if (!b || !r.docView.dom.contains(b)) {
    let Q = re.find(r.docView, O);
    if (!Q)
      return d > a.top + a.height / 2 ? a.to : a.from;
    ({ node: b, offset: S } = Qo(Q.dom, c, f));
  }
  let k = r.docView.nearest(b);
  if (!k)
    return null;
  if (k.isWidget && ((s = k.dom) === null || s === void 0 ? void 0 : s.nodeType) == 1) {
    let Q = k.dom.getBoundingClientRect();
    return e.y < Q.top || e.y <= Q.bottom && e.x <= (Q.left + Q.right) / 2 ? k.posAtStart : k.posAtEnd;
  } else
    return k.localPosFromDOM(b, S) + k.posAtStart;
}
function _a(r, e, t, i, n) {
  let s = Math.round((i - e.left) * r.defaultCharacterWidth);
  if (r.lineWrapping && t.height > r.defaultLineHeight * 1.5) {
    let l = r.viewState.heightOracle.textHeight, a = Math.floor((n - t.top - (r.defaultLineHeight - l) * 0.5) / l);
    s += a * r.viewState.heightOracle.lineLength;
  }
  let o = r.state.sliceDoc(t.from, t.to);
  return t.from + ao(o, s, r.state.tabSize);
}
function cg(r, e, t) {
  let i;
  if (r.nodeType != 3 || e != (i = r.nodeValue.length))
    return !1;
  for (let n = r.nextSibling; n; n = n.nextSibling)
    if (n.nodeType != 1 || n.nodeName != "BR")
      return !1;
  return Kt(r, i - 1, i).getBoundingClientRect().left > t;
}
function fg(r, e, t) {
  if (e != 0)
    return !1;
  for (let n = r; ; ) {
    let s = n.parentNode;
    if (!s || s.nodeType != 1 || s.firstChild != n)
      return !1;
    if (s.classList.contains("cm-line"))
      break;
    n = s;
  }
  let i = r.nodeType == 1 ? r.getBoundingClientRect() : Kt(r, 0, Math.max(r.nodeValue.length, 1)).getBoundingClientRect();
  return t - i.left > 5;
}
function wo(r, e) {
  let t = r.lineBlockAt(e);
  if (Array.isArray(t.type)) {
    for (let i of t.type)
      if (i.to > e || i.to == e && (i.to == t.to || i.type == xe.Text))
        return i;
  }
  return t;
}
function ug(r, e, t, i) {
  let n = wo(r, e.head), s = !i || n.type != xe.Text || !(r.lineWrapping || n.widgetLineBreaks) ? null : r.coordsAtPos(e.assoc < 0 && e.head > n.from ? e.head - 1 : e.head);
  if (s) {
    let o = r.dom.getBoundingClientRect(), l = r.textDirectionAt(n.from), a = r.posAtCoords({
      x: t == (l == J.LTR) ? o.right - 1 : o.left + 1,
      y: (s.top + s.bottom) / 2
    });
    if (a != null)
      return y.cursor(a, t ? -1 : 1);
  }
  return y.cursor(t ? n.to : n.from, t ? -1 : 1);
}
function Ua(r, e, t, i) {
  let n = r.state.doc.lineAt(e.head), s = r.bidiSpans(n), o = r.textDirectionAt(n.from);
  for (let l = e, a = null; ; ) {
    let h = Hm(n, s, o, l, t), c = Af;
    if (!h) {
      if (n.number == (t ? r.state.doc.lines : 1))
        return l;
      c = `
`, n = r.state.doc.line(n.number + (t ? 1 : -1)), s = r.bidiSpans(n), h = r.visualLineSide(n, !t);
    }
    if (a) {
      if (!a(c))
        return l;
    } else {
      if (!i)
        return h;
      a = i(c);
    }
    l = h;
  }
}
function dg(r, e, t) {
  let i = r.state.charCategorizer(e), n = i(t);
  return (s) => {
    let o = i(s);
    return n == ee.Space && (n = o), n == o;
  };
}
function Og(r, e, t, i) {
  let n = e.head, s = t ? 1 : -1;
  if (n == (t ? r.state.doc.length : 0))
    return y.cursor(n, e.assoc);
  let o = e.goalColumn, l, a = r.contentDOM.getBoundingClientRect(), h = r.coordsAtPos(n, e.assoc || -1), c = r.documentTop;
  if (h)
    o == null && (o = h.left - a.left), l = s < 0 ? h.top : h.bottom;
  else {
    let O = r.viewState.lineBlockAt(n);
    o == null && (o = Math.min(a.right - a.left, r.defaultCharacterWidth * (n - O.from))), l = (s < 0 ? O.top : O.bottom) + c;
  }
  let f = a.left + o, d = i ?? r.viewState.heightOracle.textHeight >> 1;
  for (let O = 0; ; O += 10) {
    let p = l + (d + O) * s, m = jf(r, { x: f, y: p }, !1, s);
    if (p < a.top || p > a.bottom || (s < 0 ? m < n : m > n)) {
      let g = r.docView.coordsForChar(m), b = !g || p < g.top ? -1 : 1;
      return y.cursor(m, b, void 0, o);
    }
  }
}
function gn(r, e, t) {
  for (; ; ) {
    let i = 0;
    for (let n of r)
      n.between(e - 1, e + 1, (s, o, l) => {
        if (e > s && e < o) {
          let a = i || t || (e - s < o - e ? -1 : 1);
          e = a < 0 ? s : o, i = a;
        }
      });
    if (!i)
      return e;
  }
}
function ys(r, e, t) {
  let i = gn(r.state.facet(dl).map((n) => n(r)), t.from, e.head > t.from ? -1 : 1);
  return i == t.from ? t : y.cursor(i, i < t.from ? 1 : -1);
}
const Ui = "￿";
class pg {
  constructor(e, t) {
    this.points = e, this.text = "", this.lineSeparator = t.facet(B.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Ui;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let i = e.parentNode;
    for (let n = e; ; ) {
      this.findPointBefore(i, n);
      let s = this.text.length;
      this.readNode(n);
      let o = n.nextSibling;
      if (o == t)
        break;
      let l = j.get(n), a = j.get(o);
      (l && a ? l.breakAfter : (l ? l.breakAfter : Xn(n)) || Xn(o) && (n.nodeName != "BR" || n.cmIgnore) && this.text.length > s) && this.lineBreak(), n = o;
    }
    return this.findPointBefore(i, t), this;
  }
  readTextNode(e) {
    let t = e.nodeValue;
    for (let i of this.points)
      i.node == e && (i.pos = this.text.length + Math.min(i.offset, t.length));
    for (let i = 0, n = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let s = -1, o = 1, l;
      if (this.lineSeparator ? (s = t.indexOf(this.lineSeparator, i), o = this.lineSeparator.length) : (l = n.exec(t)) && (s = l.index, o = l[0].length), this.append(t.slice(i, s < 0 ? t.length : s)), s < 0)
        break;
      if (this.lineBreak(), o > 1)
        for (let a of this.points)
          a.node == e && a.pos > this.text.length && (a.pos -= o - 1);
      i = s + o;
    }
  }
  readNode(e) {
    if (e.cmIgnore)
      return;
    let t = j.get(e), i = t && t.overrideDOMText;
    if (i != null) {
      this.findPointInside(e, i.length);
      for (let n = i.iter(); !n.next().done; )
        n.lineBreak ? this.lineBreak() : this.append(n.value);
    } else e.nodeType == 3 ? this.readTextNode(e) : e.nodeName == "BR" ? e.nextSibling && this.lineBreak() : e.nodeType == 1 && this.readRange(e.firstChild, null);
  }
  findPointBefore(e, t) {
    for (let i of this.points)
      i.node == e && e.childNodes[i.offset] == t && (i.pos = this.text.length);
  }
  findPointInside(e, t) {
    for (let i of this.points)
      (e.nodeType == 3 ? i.node == e : e.contains(i.node)) && (i.pos = this.text.length + (mg(e, i.node, i.offset) ? t : 0));
  }
}
function mg(r, e, t) {
  for (; ; ) {
    if (!e || t < gt(e))
      return !1;
    if (e == r)
      return !0;
    t = Ht(e) + 1, e = e.parentNode;
  }
}
class Ia {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class gg {
  constructor(e, t, i, n) {
    this.typeOver = n, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: s, impreciseAnchor: o } = e.docView;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = e.docView.domBoundsAround(t, i, 0))) {
      let l = s || o ? [] : yg(e), a = new pg(l, e.state);
      a.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = a.text, this.newSel = xg(l, this.bounds.from);
    } else {
      let l = e.observer.selectionRange, a = s && s.node == l.focusNode && s.offset == l.focusOffset || !fo(e.contentDOM, l.focusNode) ? e.state.selection.main.head : e.docView.posFromDOM(l.focusNode, l.focusOffset), h = o && o.node == l.anchorNode && o.offset == l.anchorOffset || !fo(e.contentDOM, l.anchorNode) ? e.state.selection.main.anchor : e.docView.posFromDOM(l.anchorNode, l.anchorOffset), c = e.viewport;
      if ((Z.ios || Z.chrome) && e.state.selection.main.empty && a != h && (c.from > 0 || c.to < e.state.doc.length)) {
        let f = Math.min(a, h), d = Math.max(a, h), O = c.from - f, p = c.to - d;
        (O == 0 || O == 1 || f == 0) && (p == 0 || p == -1 || d == e.state.doc.length) && (a = 0, h = e.state.doc.length);
      }
      this.newSel = y.single(h, a);
    }
  }
}
function Gf(r, e) {
  let t, { newSel: i } = e, n = r.state.selection.main, s = r.inputState.lastKeyTime > Date.now() - 100 ? r.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: o, to: l } = e.bounds, a = n.from, h = null;
    (s === 8 || Z.android && e.text.length < l - o) && (a = n.to, h = "end");
    let c = Sg(r.state.doc.sliceString(o, l, Ui), e.text, a - o, h);
    c && (Z.chrome && s == 13 && c.toB == c.from + 2 && e.text.slice(c.from, c.toB) == Ui + Ui && c.toB--, t = {
      from: o + c.from,
      to: o + c.toA,
      insert: L.of(e.text.slice(c.from, c.toB).split(Ui))
    });
  } else i && (!r.hasFocus && r.state.facet(vt) || i.main.eq(n)) && (i = null);
  if (!t && !i)
    return !1;
  if (!t && e.typeOver && !n.empty && i && i.main.empty ? t = { from: n.from, to: n.to, insert: r.state.doc.slice(n.from, n.to) } : t && t.from >= n.from && t.to <= n.to && (t.from != n.from || t.to != n.to) && n.to - n.from - (t.to - t.from) <= 4 ? t = {
    from: n.from,
    to: n.to,
    insert: r.state.doc.slice(n.from, t.from).append(t.insert).append(r.state.doc.slice(t.to, n.to))
  } : (Z.mac || Z.android) && t && t.from == t.to && t.from == n.head - 1 && /^\. ?$/.test(t.insert.toString()) && r.contentDOM.getAttribute("autocorrect") == "off" ? (i && t.insert.length == 2 && (i = y.single(i.main.anchor - 1, i.main.head - 1)), t = { from: n.from, to: n.to, insert: L.of([" "]) }) : Z.chrome && t && t.from == t.to && t.from == n.head && t.insert.toString() == `
 ` && r.lineWrapping && (i && (i = y.single(i.main.anchor - 1, i.main.head - 1)), t = { from: n.from, to: n.to, insert: L.of([" "]) }), t)
    return Ol(r, t, i, s);
  if (i && !i.main.eq(n)) {
    let o = !1, l = "select";
    return r.inputState.lastSelectionTime > Date.now() - 50 && (r.inputState.lastSelectionOrigin == "select" && (o = !0), l = r.inputState.lastSelectionOrigin), r.dispatch({ selection: i, scrollIntoView: o, userEvent: l }), !0;
  } else
    return !1;
}
function Ol(r, e, t, i = -1) {
  if (Z.ios && r.inputState.flushIOSKey(e))
    return !0;
  let n = r.state.selection.main;
  if (Z.android && (e.to == n.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == n.from || e.from == n.from - 1 && r.state.sliceDoc(e.from, n.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && Oi(r.contentDOM, "Enter", 13) || (e.from == n.from - 1 && e.to == n.to && e.insert.length == 0 || i == 8 && e.insert.length < e.to - e.from && e.to > n.head) && Oi(r.contentDOM, "Backspace", 8) || e.from == n.from && e.to == n.to + 1 && e.insert.length == 0 && Oi(r.contentDOM, "Delete", 46)))
    return !0;
  let s = e.insert.toString();
  r.inputState.composing >= 0 && r.inputState.composing++;
  let o, l = () => o || (o = bg(r, e, t));
  return r.state.facet(Wf).some((a) => a(r, e.from, e.to, s, l)) || r.dispatch(l()), !0;
}
function bg(r, e, t) {
  let i, n = r.state, s = n.selection.main;
  if (e.from >= s.from && e.to <= s.to && e.to - e.from >= (s.to - s.from) / 3 && (!t || t.main.empty && t.main.from == e.from + e.insert.length) && r.inputState.composing < 0) {
    let l = s.from < e.from ? n.sliceDoc(s.from, e.from) : "", a = s.to > e.to ? n.sliceDoc(e.to, s.to) : "";
    i = n.replaceSelection(r.state.toText(l + e.insert.sliceString(0, void 0, r.state.lineBreak) + a));
  } else {
    let l = n.changes(e), a = t && t.main.to <= l.newLength ? t.main : void 0;
    if (n.selection.ranges.length > 1 && r.inputState.composing >= 0 && e.to <= s.to && e.to >= s.to - 10) {
      let h = r.state.sliceDoc(e.from, e.to), c, f = t && If(r, t.main.head);
      if (f) {
        let p = e.insert.length - (e.to - e.from);
        c = { from: f.from, to: f.to - p };
      } else
        c = r.state.doc.lineAt(s.head);
      let d = s.to - e.to, O = s.to - s.from;
      i = n.changeByRange((p) => {
        if (p.from == s.from && p.to == s.to)
          return { changes: l, range: a || p.map(l) };
        let m = p.to - d, g = m - h.length;
        if (p.to - p.from != O || r.state.sliceDoc(g, m) != h || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        p.to >= c.from && p.from <= c.to)
          return { range: p };
        let b = n.changes({ from: g, to: m, insert: e.insert }), S = p.to - s.to;
        return {
          changes: b,
          range: a ? y.range(Math.max(0, a.anchor + S), Math.max(0, a.head + S)) : p.map(b)
        };
      });
    } else
      i = {
        changes: l,
        selection: a && n.selection.replaceRange(a)
      };
  }
  let o = "input.type";
  return (r.composing || r.inputState.compositionPendingChange && r.inputState.compositionEndedAt > Date.now() - 50) && (r.inputState.compositionPendingChange = !1, o += ".compose", r.inputState.compositionFirstChange && (o += ".start", r.inputState.compositionFirstChange = !1)), n.update(i, { userEvent: o, scrollIntoView: !0 });
}
function Sg(r, e, t, i) {
  let n = Math.min(r.length, e.length), s = 0;
  for (; s < n && r.charCodeAt(s) == e.charCodeAt(s); )
    s++;
  if (s == n && r.length == e.length)
    return null;
  let o = r.length, l = e.length;
  for (; o > 0 && l > 0 && r.charCodeAt(o - 1) == e.charCodeAt(l - 1); )
    o--, l--;
  if (i == "end") {
    let a = Math.max(0, s - Math.min(o, l));
    t -= o + a - s;
  }
  if (o < s && r.length < e.length) {
    let a = t <= s && t >= o ? s - t : 0;
    s -= a, l = s + (l - o), o = s;
  } else if (l < s) {
    let a = t <= s && t >= l ? s - t : 0;
    s -= a, o = s + (o - l), l = s;
  }
  return { from: s, toA: o, toB: l };
}
function yg(r) {
  let e = [];
  if (r.root.activeElement != r.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: i, focusNode: n, focusOffset: s } = r.observer.selectionRange;
  return t && (e.push(new Ia(t, i)), (n != t || s != i) && e.push(new Ia(n, s))), e;
}
function xg(r, e) {
  if (r.length == 0)
    return null;
  let t = r[0].pos, i = r.length == 2 ? r[1].pos : t;
  return t > -1 && i > -1 ? y.single(t + e, i + e) : null;
}
class kg {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.lastTouchTime = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.pendingIOSKey = void 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, Z.safari && e.contentDOM.addEventListener("input", () => null), Z.gecko && Dg(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !Tg(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || this.runHandlers(e.type, e);
  }
  runHandlers(e, t) {
    let i = this.handlers[e];
    if (i) {
      for (let n of i.observers)
        n(this.view, t);
      for (let n of i.handlers) {
        if (t.defaultPrevented)
          break;
        if (n(this.view, t)) {
          t.preventDefault();
          break;
        }
      }
    }
  }
  ensureHandlers(e) {
    let t = Qg(e), i = this.handlers, n = this.view.contentDOM;
    for (let s in t)
      if (s != "scroll") {
        let o = !t[s].handlers.length, l = i[s];
        l && o != !l.handlers.length && (n.removeEventListener(s, this.handleEvent), l = null), l || n.addEventListener(s, this.handleEvent, { passive: o });
      }
    for (let s in i)
      s != "scroll" && !t[s] && n.removeEventListener(s, this.handleEvent);
    this.handlers = t;
  }
  keydown(e) {
    if (this.lastKeyCode = e.keyCode, this.lastKeyTime = Date.now(), e.keyCode == 9 && this.tabFocusMode > -1 && (!this.tabFocusMode || Date.now() <= this.tabFocusMode))
      return !0;
    if (this.tabFocusMode > 0 && e.keyCode != 27 && Hf.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), Z.android && Z.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    let t;
    return Z.ios && !e.synthetic && !e.altKey && !e.metaKey && ((t = Ff.find((i) => i.keyCode == e.keyCode)) && !e.ctrlKey || wg.indexOf(e.key) > -1 && e.ctrlKey && !e.shiftKey) ? (this.pendingIOSKey = t || e, setTimeout(() => this.flushIOSKey(), 250), !0) : (e.keyCode != 229 && this.view.observer.forceFlush(), !1);
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, Oi(this.view.contentDOM, t.key, t.keyCode, t instanceof KeyboardEvent ? t : void 0));
  }
  ignoreDuringComposition(e) {
    return /^key/.test(e.type) ? this.composing > 0 ? !0 : Z.safari && !Z.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1 : !1;
  }
  startMouseSelection(e) {
    this.mouseSelection && this.mouseSelection.destroy(), this.mouseSelection = e;
  }
  update(e) {
    this.view.observer.update(e), this.mouseSelection && this.mouseSelection.update(e), this.draggedContent && e.docChanged && (this.draggedContent = this.draggedContent.map(e.changes)), e.transactions.length && (this.lastKeyCode = this.lastSelectionTime = 0);
  }
  destroy() {
    this.mouseSelection && this.mouseSelection.destroy();
  }
}
function ja(r, e) {
  return (t, i) => {
    try {
      return e.call(r, i, t);
    } catch (n) {
      Ce(t.state, n);
    }
  };
}
function Qg(r) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(i) {
    return e[i] || (e[i] = { observers: [], handlers: [] });
  }
  for (let i of r) {
    let n = i.spec;
    if (n && n.domEventHandlers)
      for (let s in n.domEventHandlers) {
        let o = n.domEventHandlers[s];
        o && t(s).handlers.push(ja(i.value, o));
      }
    if (n && n.domEventObservers)
      for (let s in n.domEventObservers) {
        let o = n.domEventObservers[s];
        o && t(s).observers.push(ja(i.value, o));
      }
  }
  for (let i in He)
    t(i).handlers.push(He[i]);
  for (let i in _e)
    t(i).observers.push(_e[i]);
  return e;
}
const Ff = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], wg = "dthko", Hf = [16, 17, 18, 20, 91, 92, 224, 225], Ir = 6;
function jr(r) {
  return Math.max(0, r) * 0.7 + 8;
}
function Pg(r, e) {
  return Math.max(Math.abs(r.clientX - e.clientX), Math.abs(r.clientY - e.clientY));
}
class $g {
  constructor(e, t, i, n) {
    this.view = e, this.startEvent = t, this.style = i, this.mustSelect = n, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = Em(e.contentDOM), this.atoms = e.state.facet(dl).map((o) => o(e));
    let s = e.contentDOM.ownerDocument;
    s.addEventListener("mousemove", this.move = this.move.bind(this)), s.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(B.allowMultipleSelections) && vg(e, t), this.dragging = Zg(e, t) && eu(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && Pg(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, i = 0, n = 0, s = 0, o = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: n, right: o } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: s, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = Uf(this.view);
    e.clientX - a.left <= n + Ir ? t = -jr(n - e.clientX) : e.clientX + a.right >= o - Ir && (t = jr(e.clientX - o)), e.clientY - a.top <= s + Ir ? i = -jr(s - e.clientY) : e.clientY + a.bottom >= l - Ir && (i = jr(e.clientY - l)), this.setScrollSpeed(t, i);
  }
  up(e) {
    this.dragging == null && this.select(this.lastEvent), this.dragging || e.preventDefault(), this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let e = this.view.contentDOM.ownerDocument;
    e.removeEventListener("mousemove", this.move), e.removeEventListener("mouseup", this.up), this.view.inputState.mouseSelection = this.view.inputState.draggedContent = null;
  }
  setScrollSpeed(e, t) {
    this.scrollSpeed = { x: e, y: t }, e || t ? this.scrolling < 0 && (this.scrolling = setInterval(() => this.scroll(), 50)) : this.scrolling > -1 && (clearInterval(this.scrolling), this.scrolling = -1);
  }
  scroll() {
    let { x: e, y: t } = this.scrollSpeed;
    e && this.scrollParents.x && (this.scrollParents.x.scrollLeft += e, e = 0), t && this.scrollParents.y && (this.scrollParents.y.scrollTop += t, t = 0), (e || t) && this.view.win.scrollBy(e, t), this.dragging === !1 && this.select(this.lastEvent);
  }
  skipAtoms(e) {
    let t = null;
    for (let i = 0; i < e.ranges.length; i++) {
      let n = e.ranges[i], s = null;
      if (n.empty) {
        let o = gn(this.atoms, n.from, 0);
        o != n.from && (s = y.cursor(o, -1));
      } else {
        let o = gn(this.atoms, n.from, -1), l = gn(this.atoms, n.to, 1);
        (o != n.from || l != n.to) && (s = y.range(n.from == n.anchor ? o : l, n.from == n.head ? o : l));
      }
      s && (t || (t = e.ranges.slice()), t[i] = s);
    }
    return t ? y.create(t, e.mainIndex) : e;
  }
  select(e) {
    let { view: t } = this, i = this.skipAtoms(this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !i.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: i,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function vg(r, e) {
  let t = r.state.facet(Rf);
  return t.length ? t[0](e) : Z.mac ? e.metaKey : e.ctrlKey;
}
function Cg(r, e) {
  let t = r.state.facet(Xf);
  return t.length ? t[0](e) : Z.mac ? !e.altKey : !e.ctrlKey;
}
function Zg(r, e) {
  let { main: t } = r.state.selection;
  if (t.empty)
    return !1;
  let i = hr(r.root);
  if (!i || i.rangeCount == 0)
    return !0;
  let n = i.getRangeAt(0).getClientRects();
  for (let s = 0; s < n.length; s++) {
    let o = n[s];
    if (o.left <= e.clientX && o.right >= e.clientX && o.top <= e.clientY && o.bottom >= e.clientY)
      return !0;
  }
  return !1;
}
function Tg(r, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, i; t != r.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (i = j.get(t)) && i.ignoreEvent(e))
      return !1;
  return !0;
}
const He = /* @__PURE__ */ Object.create(null), _e = /* @__PURE__ */ Object.create(null), Kf = Z.ie && Z.ie_version < 15 || Z.ios && Z.webkit_version < 604;
function Ag(r) {
  let e = r.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    r.focus(), t.remove(), Jf(r, t.value);
  }, 50);
}
function Jf(r, e) {
  let { state: t } = r, i, n = 1, s = t.toText(e), o = s.lines == t.selection.ranges.length;
  if (Po != null && t.selection.ranges.every((a) => a.empty) && Po == s.toString()) {
    let a = -1;
    i = t.changeByRange((h) => {
      let c = t.doc.lineAt(h.from);
      if (c.from == a)
        return { range: h };
      a = c.from;
      let f = t.toText((o ? s.line(n++).text : e) + t.lineBreak);
      return {
        changes: { from: c.from, insert: f },
        range: y.cursor(h.from + f.length)
      };
    });
  } else o ? i = t.changeByRange((a) => {
    let h = s.line(n++);
    return {
      changes: { from: a.from, to: a.to, insert: h.text },
      range: y.cursor(a.from + h.length)
    };
  }) : i = t.replaceSelection(s);
  r.dispatch(i, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
_e.scroll = (r) => {
  r.inputState.lastScrollTop = r.scrollDOM.scrollTop, r.inputState.lastScrollLeft = r.scrollDOM.scrollLeft;
};
He.keydown = (r, e) => (r.inputState.setSelectionOrigin("select"), e.keyCode == 27 && r.inputState.tabFocusMode != 0 && (r.inputState.tabFocusMode = Date.now() + 2e3), !1);
_e.touchstart = (r, e) => {
  r.inputState.lastTouchTime = Date.now(), r.inputState.setSelectionOrigin("select.pointer");
};
_e.touchmove = (r) => {
  r.inputState.setSelectionOrigin("select.pointer");
};
He.mousedown = (r, e) => {
  if (r.observer.flush(), r.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let i of r.state.facet(Mf))
    if (t = i(r, e), t)
      break;
  if (!t && e.button == 0 && (t = Mg(r, e)), t) {
    let i = !r.hasFocus;
    r.inputState.startMouseSelection(new $g(r, e, t, i)), i && r.observer.ignore(() => {
      df(r.contentDOM);
      let s = r.root.activeElement;
      s && !s.contains(r.contentDOM) && s.blur();
    });
    let n = r.inputState.mouseSelection;
    if (n)
      return n.start(e), n.dragging === !1;
  }
  return !1;
};
function Ga(r, e, t, i) {
  if (i == 1)
    return y.cursor(e, t);
  if (i == 2)
    return lg(r.state, e, t);
  {
    let n = re.find(r.docView, e), s = r.state.doc.lineAt(n ? n.posAtEnd : e), o = n ? n.posAtStart : s.from, l = n ? n.posAtEnd : s.to;
    return l < r.state.doc.length && l == s.to && l++, y.range(o, l);
  }
}
let Fa = (r, e, t) => e >= t.top && e <= t.bottom && r >= t.left && r <= t.right;
function Rg(r, e, t, i) {
  let n = re.find(r.docView, e);
  if (!n)
    return 1;
  let s = e - n.posAtStart;
  if (s == 0)
    return 1;
  if (s == n.length)
    return -1;
  let o = n.coordsAt(s, -1);
  if (o && Fa(t, i, o))
    return -1;
  let l = n.coordsAt(s, 1);
  return l && Fa(t, i, l) ? 1 : o && o.bottom >= i ? -1 : 1;
}
function Ha(r, e) {
  let t = r.posAtCoords({ x: e.clientX, y: e.clientY }, !1);
  return { pos: t, bias: Rg(r, t, e.clientX, e.clientY) };
}
const Xg = Z.ie && Z.ie_version <= 11;
let Ka = null, Ja = 0, eh = 0;
function eu(r) {
  if (!Xg)
    return r.detail;
  let e = Ka, t = eh;
  return Ka = r, eh = Date.now(), Ja = !e || t > Date.now() - 400 && Math.abs(e.clientX - r.clientX) < 2 && Math.abs(e.clientY - r.clientY) < 2 ? (Ja + 1) % 3 : 1;
}
function Mg(r, e) {
  let t = Ha(r, e), i = eu(e), n = r.state.selection;
  return {
    update(s) {
      s.docChanged && (t.pos = s.changes.mapPos(t.pos), n = n.map(s.changes));
    },
    get(s, o, l) {
      let a = Ha(r, s), h, c = Ga(r, a.pos, a.bias, i);
      if (t.pos != a.pos && !o) {
        let f = Ga(r, t.pos, t.bias, i), d = Math.min(f.from, c.from), O = Math.max(f.to, c.to);
        c = d < c.from ? y.range(d, O) : y.range(O, d);
      }
      return o ? n.replaceRange(n.main.extend(c.from, c.to)) : l && i == 1 && n.ranges.length > 1 && (h = Eg(n, a.pos)) ? h : l ? n.addRange(c) : y.create([c]);
    }
  };
}
function Eg(r, e) {
  for (let t = 0; t < r.ranges.length; t++) {
    let { from: i, to: n } = r.ranges[t];
    if (i <= e && n >= e)
      return y.create(r.ranges.slice(0, t).concat(r.ranges.slice(t + 1)), r.mainIndex == t ? 0 : r.mainIndex - (r.mainIndex > t ? 1 : 0));
  }
  return null;
}
He.dragstart = (r, e) => {
  let { selection: { main: t } } = r.state;
  if (e.target.draggable) {
    let n = r.docView.nearest(e.target);
    if (n && n.isWidget) {
      let s = n.posAtStart, o = s + n.length;
      (s >= t.to || o <= t.from) && (t = y.range(s, o));
    }
  }
  let { inputState: i } = r;
  return i.mouseSelection && (i.mouseSelection.dragging = !0), i.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", r.state.sliceDoc(t.from, t.to)), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
He.dragend = (r) => (r.inputState.draggedContent = null, !1);
function th(r, e, t, i) {
  if (!t)
    return;
  let n = r.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: s } = r.inputState, o = i && s && Cg(r, e) ? { from: s.from, to: s.to } : null, l = { from: n, insert: t }, a = r.state.changes(o ? [o, l] : l);
  r.focus(), r.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(n, -1), head: a.mapPos(n, 1) },
    userEvent: o ? "move.drop" : "input.drop"
  }), r.inputState.draggedContent = null;
}
He.drop = (r, e) => {
  if (!e.dataTransfer)
    return !1;
  if (r.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let i = Array(t.length), n = 0, s = () => {
      ++n == t.length && th(r, e, i.filter((o) => o != null).join(r.state.lineBreak), !1);
    };
    for (let o = 0; o < t.length; o++) {
      let l = new FileReader();
      l.onerror = s, l.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(l.result) || (i[o] = l.result), s();
      }, l.readAsText(t[o]);
    }
    return !0;
  } else {
    let i = e.dataTransfer.getData("Text");
    if (i)
      return th(r, e, i, !0), !0;
  }
  return !1;
};
He.paste = (r, e) => {
  if (r.state.readOnly)
    return !0;
  r.observer.flush();
  let t = Kf ? null : e.clipboardData;
  return t ? (Jf(r, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (Ag(r), !1);
};
function Wg(r, e) {
  let t = r.dom.parentNode;
  if (!t)
    return;
  let i = t.appendChild(document.createElement("textarea"));
  i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.value = e, i.focus(), i.selectionEnd = e.length, i.selectionStart = 0, setTimeout(() => {
    i.remove(), r.focus();
  }, 50);
}
function Yg(r) {
  let e = [], t = [], i = !1;
  for (let n of r.selection.ranges)
    n.empty || (e.push(r.sliceDoc(n.from, n.to)), t.push(n));
  if (!e.length) {
    let n = -1;
    for (let { from: s } of r.selection.ranges) {
      let o = r.doc.lineAt(s);
      o.number > n && (e.push(o.text), t.push({ from: o.from, to: Math.min(r.doc.length, o.to + 1) })), n = o.number;
    }
    i = !0;
  }
  return { text: e.join(r.lineBreak), ranges: t, linewise: i };
}
let Po = null;
He.copy = He.cut = (r, e) => {
  let { text: t, ranges: i, linewise: n } = Yg(r.state);
  if (!t && !n)
    return !1;
  Po = n ? t : null, e.type == "cut" && !r.state.readOnly && r.dispatch({
    changes: i,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let s = Kf ? null : e.clipboardData;
  return s ? (s.clearData(), s.setData("text/plain", t), !0) : (Wg(r, t), !1);
};
const tu = /* @__PURE__ */ kt.define();
function iu(r, e) {
  let t = [];
  for (let i of r.facet(Yf)) {
    let n = i(r, e);
    n && t.push(n);
  }
  return t ? r.update({ effects: t, annotations: tu.of(!0) }) : null;
}
function ru(r) {
  setTimeout(() => {
    let e = r.hasFocus;
    if (e != r.inputState.notifiedFocused) {
      let t = iu(r.state, e);
      t ? r.dispatch(t) : r.update([]);
    }
  }, 10);
}
_e.focus = (r) => {
  r.inputState.lastFocusTime = Date.now(), !r.scrollDOM.scrollTop && (r.inputState.lastScrollTop || r.inputState.lastScrollLeft) && (r.scrollDOM.scrollTop = r.inputState.lastScrollTop, r.scrollDOM.scrollLeft = r.inputState.lastScrollLeft), ru(r);
};
_e.blur = (r) => {
  r.observer.clearSelectionRange(), ru(r);
};
_e.compositionstart = _e.compositionupdate = (r) => {
  r.observer.editContext || (r.inputState.compositionFirstChange == null && (r.inputState.compositionFirstChange = !0), r.inputState.composing < 0 && (r.inputState.composing = 0));
};
_e.compositionend = (r) => {
  r.observer.editContext || (r.inputState.composing = -1, r.inputState.compositionEndedAt = Date.now(), r.inputState.compositionPendingKey = !0, r.inputState.compositionPendingChange = r.observer.pendingRecords().length > 0, r.inputState.compositionFirstChange = null, Z.chrome && Z.android ? r.observer.flushSoon() : r.inputState.compositionPendingChange ? Promise.resolve().then(() => r.observer.flush()) : setTimeout(() => {
    r.inputState.composing < 0 && r.docView.hasComposition && r.update([]);
  }, 50));
};
_e.contextmenu = (r) => {
  r.inputState.lastContextMenu = Date.now();
};
He.beforeinput = (r, e) => {
  var t, i;
  if (e.inputType == "insertReplacementText" && r.observer.editContext) {
    let s = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), o = e.getTargetRanges();
    if (s && o.length) {
      let l = o[0], a = r.posAtDOM(l.startContainer, l.startOffset), h = r.posAtDOM(l.endContainer, l.endOffset);
      return Ol(r, { from: a, to: h, insert: r.state.toText(s) }, null), !0;
    }
  }
  let n;
  if (Z.chrome && Z.android && (n = Ff.find((s) => s.inputType == e.inputType)) && (r.observer.delayAndroidKey(n.key, n.keyCode), n.key == "Backspace" || n.key == "Delete")) {
    let s = ((i = window.visualViewport) === null || i === void 0 ? void 0 : i.height) || 0;
    setTimeout(() => {
      var o;
      (((o = window.visualViewport) === null || o === void 0 ? void 0 : o.height) || 0) > s + 10 && r.hasFocus && (r.contentDOM.blur(), r.focus());
    }, 100);
  }
  return Z.ios && e.inputType == "deleteContentForward" && r.observer.flushSoon(), Z.safari && e.inputType == "insertText" && r.inputState.composing >= 0 && setTimeout(() => _e.compositionend(r, e), 20), !1;
};
const ih = /* @__PURE__ */ new Set();
function Dg(r) {
  ih.has(r) || (ih.add(r), r.addEventListener("copy", () => {
  }), r.addEventListener("cut", () => {
  }));
}
const rh = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let ki = !1;
function nh() {
  ki = !1;
}
class qg {
  constructor(e) {
    this.lineWrapping = e, this.doc = L.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
  }
  heightForGap(e, t) {
    let i = this.doc.lineAt(t).number - this.doc.lineAt(e).number + 1;
    return this.lineWrapping && (i += Math.max(0, Math.ceil((t - e - i * this.lineLength * 0.5) / this.lineLength))), this.lineHeight * i;
  }
  heightForLine(e) {
    return this.lineWrapping ? (1 + Math.max(0, Math.ceil((e - this.lineLength) / (this.lineLength - 5)))) * this.lineHeight : this.lineHeight;
  }
  setDoc(e) {
    return this.doc = e, this;
  }
  mustRefreshForWrapping(e) {
    return rh.indexOf(e) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(e) {
    let t = !1;
    for (let i = 0; i < e.length; i++) {
      let n = e[i];
      n < 0 ? i++ : this.heightSamples[Math.floor(n * 10)] || (t = !0, this.heightSamples[Math.floor(n * 10)] = !0);
    }
    return t;
  }
  refresh(e, t, i, n, s, o) {
    let l = rh.indexOf(e) > -1, a = Math.round(t) != Math.round(this.lineHeight) || this.lineWrapping != l;
    if (this.lineWrapping = l, this.lineHeight = t, this.charWidth = i, this.textHeight = n, this.lineLength = s, a) {
      this.heightSamples = {};
      for (let h = 0; h < o.length; h++) {
        let c = o[h];
        c < 0 ? h++ : this.heightSamples[Math.floor(c * 10)] = !0;
      }
    }
    return a;
  }
}
class Vg {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class ot {
  /**
  @internal
  */
  constructor(e, t, i, n, s) {
    this.from = e, this.length = t, this.top = i, this.height = n, this._content = s;
  }
  /**
  The type of element this is. When querying lines, this may be
  an array of all the blocks that make up the line.
  */
  get type() {
    return typeof this._content == "number" ? xe.Text : Array.isArray(this._content) ? this._content : this._content.type;
  }
  /**
  The end of the element as a document position.
  */
  get to() {
    return this.from + this.length;
  }
  /**
  The bottom position of the element.
  */
  get bottom() {
    return this.top + this.height;
  }
  /**
  If this is a widget block, this will return the widget
  associated with it.
  */
  get widget() {
    return this._content instanceof Dt ? this._content.widget : null;
  }
  /**
  If this is a textblock, this holds the number of line breaks
  that appear in widgets inside the block.
  */
  get widgetLineBreaks() {
    return typeof this._content == "number" ? this._content : 0;
  }
  /**
  @internal
  */
  join(e) {
    let t = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(e._content) ? e._content : [e]);
    return new ot(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var K = /* @__PURE__ */ function(r) {
  return r[r.ByPos = 0] = "ByPos", r[r.ByHeight = 1] = "ByHeight", r[r.ByPosNoHeight = 2] = "ByPosNoHeight", r;
}(K || (K = {}));
const bn = 1e-3;
class ke {
  constructor(e, t, i = 2) {
    this.length = e, this.height = t, this.flags = i;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(e) {
    this.flags = (e ? 2 : 0) | this.flags & -3;
  }
  setHeight(e) {
    this.height != e && (Math.abs(this.height - e) > bn && (ki = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, i) {
    return ke.of(i);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(e, t) {
    t.push(this);
  }
  decomposeRight(e, t) {
    t.push(this);
  }
  applyChanges(e, t, i, n) {
    let s = this, o = i.doc;
    for (let l = n.length - 1; l >= 0; l--) {
      let { fromA: a, toA: h, fromB: c, toB: f } = n[l], d = s.lineAt(a, K.ByPosNoHeight, i.setDoc(t), 0, 0), O = d.to >= h ? d : s.lineAt(h, K.ByPosNoHeight, i, 0, 0);
      for (f += O.to - h, h = O.to; l > 0 && d.from <= n[l - 1].toA; )
        a = n[l - 1].fromA, c = n[l - 1].fromB, l--, a < d.from && (d = s.lineAt(a, K.ByPosNoHeight, i, 0, 0));
      c += d.from - a, a = d.from;
      let p = pl.build(i.setDoc(o), e, c, f);
      s = Wn(s, s.replace(a, h, p));
    }
    return s.updateHeight(i, 0);
  }
  static empty() {
    return new Me(0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(e) {
    if (e.length == 1)
      return e[0];
    let t = 0, i = e.length, n = 0, s = 0;
    for (; ; )
      if (t == i)
        if (n > s * 2) {
          let l = e[t - 1];
          l.break ? e.splice(--t, 1, l.left, null, l.right) : e.splice(--t, 1, l.left, l.right), i += 1 + l.break, n -= l.size;
        } else if (s > n * 2) {
          let l = e[i];
          l.break ? e.splice(i, 1, l.left, null, l.right) : e.splice(i, 1, l.left, l.right), i += 2 + l.break, s -= l.size;
        } else
          break;
      else if (n < s) {
        let l = e[t++];
        l && (n += l.size);
      } else {
        let l = e[--i];
        l && (s += l.size);
      }
    let o = 0;
    return e[t - 1] == null ? (o = 1, t--) : e[t] == null && (o = 1, i++), new Bg(ke.of(e.slice(0, t)), o, ke.of(e.slice(i)));
  }
}
function Wn(r, e) {
  return r == e ? r : (r.constructor != e.constructor && (ki = !0), e);
}
ke.prototype.size = 1;
class nu extends ke {
  constructor(e, t, i) {
    super(e, t), this.deco = i;
  }
  blockAt(e, t, i, n) {
    return new ot(n, this.length, i, this.height, this.deco || 0);
  }
  lineAt(e, t, i, n, s) {
    return this.blockAt(0, i, n, s);
  }
  forEachLine(e, t, i, n, s, o) {
    e <= s + this.length && t >= s && o(this.blockAt(0, i, n, s));
  }
  updateHeight(e, t = 0, i = !1, n) {
    return n && n.from <= t && n.more && this.setHeight(n.heights[n.index++]), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class Me extends nu {
  constructor(e, t) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0;
  }
  blockAt(e, t, i, n) {
    return new ot(n, this.length, i, this.height, this.breaks);
  }
  replace(e, t, i) {
    let n = i[0];
    return i.length == 1 && (n instanceof Me || n instanceof ce && n.flags & 4) && Math.abs(this.length - n.length) < 10 ? (n instanceof ce ? n = new Me(n.length, this.height) : n.height = this.height, this.outdated || (n.outdated = !1), n) : ke.of(i);
  }
  updateHeight(e, t = 0, i = !1, n) {
    return n && n.from <= t && n.more ? this.setHeight(n.heights[n.index++]) : (i || this.outdated) && this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class ce extends ke {
  constructor(e) {
    super(e, 0);
  }
  heightMetrics(e, t) {
    let i = e.doc.lineAt(t).number, n = e.doc.lineAt(t + this.length).number, s = n - i + 1, o, l = 0;
    if (e.lineWrapping) {
      let a = Math.min(this.height, e.lineHeight * s);
      o = a / s, this.length > s + 1 && (l = (this.height - a) / (this.length - s - 1));
    } else
      o = this.height / s;
    return { firstLine: i, lastLine: n, perLine: o, perChar: l };
  }
  blockAt(e, t, i, n) {
    let { firstLine: s, lastLine: o, perLine: l, perChar: a } = this.heightMetrics(t, n);
    if (t.lineWrapping) {
      let h = n + (e < t.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (e - i) / this.height)) * this.length)), c = t.doc.lineAt(h), f = l + c.length * a, d = Math.max(i, e - f / 2);
      return new ot(c.from, c.length, d, f, 0);
    } else {
      let h = Math.max(0, Math.min(o - s, Math.floor((e - i) / l))), { from: c, length: f } = t.doc.line(s + h);
      return new ot(c, f, i + l * h, l, 0);
    }
  }
  lineAt(e, t, i, n, s) {
    if (t == K.ByHeight)
      return this.blockAt(e, i, n, s);
    if (t == K.ByPosNoHeight) {
      let { from: O, to: p } = i.doc.lineAt(e);
      return new ot(O, p - O, 0, 0, 0);
    }
    let { firstLine: o, perLine: l, perChar: a } = this.heightMetrics(i, s), h = i.doc.lineAt(e), c = l + h.length * a, f = h.number - o, d = n + l * f + a * (h.from - s - f);
    return new ot(h.from, h.length, Math.max(n, Math.min(d, n + this.height - c)), c, 0);
  }
  forEachLine(e, t, i, n, s, o) {
    e = Math.max(e, s), t = Math.min(t, s + this.length);
    let { firstLine: l, perLine: a, perChar: h } = this.heightMetrics(i, s);
    for (let c = e, f = n; c <= t; ) {
      let d = i.doc.lineAt(c);
      if (c == e) {
        let p = d.number - l;
        f += a * p + h * (e - s - p);
      }
      let O = a + h * d.length;
      o(new ot(d.from, d.length, f, O, 0)), f += O, c = d.to + 1;
    }
  }
  replace(e, t, i) {
    let n = this.length - t;
    if (n > 0) {
      let s = i[i.length - 1];
      s instanceof ce ? i[i.length - 1] = new ce(s.length + n) : i.push(null, new ce(n - 1));
    }
    if (e > 0) {
      let s = i[0];
      s instanceof ce ? i[0] = new ce(e + s.length) : i.unshift(new ce(e - 1), null);
    }
    return ke.of(i);
  }
  decomposeLeft(e, t) {
    t.push(new ce(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new ce(this.length - e - 1));
  }
  updateHeight(e, t = 0, i = !1, n) {
    let s = t + this.length;
    if (n && n.from <= t + this.length && n.more) {
      let o = [], l = Math.max(t, n.from), a = -1;
      for (n.from > t && o.push(new ce(n.from - t - 1).updateHeight(e, t)); l <= s && n.more; ) {
        let c = e.doc.lineAt(l).length;
        o.length && o.push(null);
        let f = n.heights[n.index++];
        a == -1 ? a = f : Math.abs(f - a) >= bn && (a = -2);
        let d = new Me(c, f);
        d.outdated = !1, o.push(d), l += c + 1;
      }
      l <= s && o.push(null, new ce(s - l).updateHeight(e, l));
      let h = ke.of(o);
      return (a < 0 || Math.abs(h.height - this.height) >= bn || Math.abs(a - this.heightMetrics(e, t).perLine) >= bn) && (ki = !0), Wn(this, h);
    } else (i || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class Bg extends ke {
  constructor(e, t, i) {
    super(e.length + t + i.length, e.height + i.height, t | (e.outdated || i.outdated ? 2 : 0)), this.left = e, this.right = i, this.size = e.size + i.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(e, t, i, n) {
    let s = i + this.left.height;
    return e < s ? this.left.blockAt(e, t, i, n) : this.right.blockAt(e, t, s, n + this.left.length + this.break);
  }
  lineAt(e, t, i, n, s) {
    let o = n + this.left.height, l = s + this.left.length + this.break, a = t == K.ByHeight ? e < o : e < l, h = a ? this.left.lineAt(e, t, i, n, s) : this.right.lineAt(e, t, i, o, l);
    if (this.break || (a ? h.to < l : h.from > l))
      return h;
    let c = t == K.ByPosNoHeight ? K.ByPosNoHeight : K.ByPos;
    return a ? h.join(this.right.lineAt(l, c, i, o, l)) : this.left.lineAt(l, c, i, n, s).join(h);
  }
  forEachLine(e, t, i, n, s, o) {
    let l = n + this.left.height, a = s + this.left.length + this.break;
    if (this.break)
      e < a && this.left.forEachLine(e, t, i, n, s, o), t >= a && this.right.forEachLine(e, t, i, l, a, o);
    else {
      let h = this.lineAt(a, K.ByPos, i, n, s);
      e < h.from && this.left.forEachLine(e, h.from - 1, i, n, s, o), h.to >= e && h.from <= t && o(h), t > h.to && this.right.forEachLine(h.to + 1, t, i, l, a, o);
    }
  }
  replace(e, t, i) {
    let n = this.left.length + this.break;
    if (t < n)
      return this.balanced(this.left.replace(e, t, i), this.right);
    if (e > this.left.length)
      return this.balanced(this.left, this.right.replace(e - n, t - n, i));
    let s = [];
    e > 0 && this.decomposeLeft(e, s);
    let o = s.length;
    for (let l of i)
      s.push(l);
    if (e > 0 && sh(s, o - 1), t < this.length) {
      let l = s.length;
      this.decomposeRight(t, s), sh(s, l);
    }
    return ke.of(s);
  }
  decomposeLeft(e, t) {
    let i = this.left.length;
    if (e <= i)
      return this.left.decomposeLeft(e, t);
    t.push(this.left), this.break && (i++, e >= i && t.push(null)), e > i && this.right.decomposeLeft(e - i, t);
  }
  decomposeRight(e, t) {
    let i = this.left.length, n = i + this.break;
    if (e >= n)
      return this.right.decomposeRight(e - n, t);
    e < i && this.left.decomposeRight(e, t), this.break && e < n && t.push(null), t.push(this.right);
  }
  balanced(e, t) {
    return e.size > 2 * t.size || t.size > 2 * e.size ? ke.of(this.break ? [e, null, t] : [e, t]) : (this.left = Wn(this.left, e), this.right = Wn(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, i = !1, n) {
    let { left: s, right: o } = this, l = t + s.length + this.break, a = null;
    return n && n.from <= t + s.length && n.more ? a = s = s.updateHeight(e, t, i, n) : s.updateHeight(e, t, i), n && n.from <= l + o.length && n.more ? a = o = o.updateHeight(e, l, i, n) : o.updateHeight(e, l, i), a ? this.balanced(s, o) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function sh(r, e) {
  let t, i;
  r[e] == null && (t = r[e - 1]) instanceof ce && (i = r[e + 1]) instanceof ce && r.splice(e - 1, 3, new ce(t.length + 1 + i.length));
}
const zg = 5;
class pl {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let i = Math.min(t, this.lineEnd), n = this.nodes[this.nodes.length - 1];
      n instanceof Me ? n.length += i - this.pos : (i > this.pos || !this.isCovered) && this.nodes.push(new Me(i - this.pos, -1)), this.writtenTo = i, t > i && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, i) {
    if (e < t || i.heightRelevant) {
      let n = i.widget ? i.widget.estimatedHeight : 0, s = i.widget ? i.widget.lineBreaks : 0;
      n < 0 && (n = this.oracle.lineHeight);
      let o = t - e;
      i.block ? this.addBlock(new nu(o, n, i)) : (o || s || n >= zg) && this.addLineDeco(n, s, o);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new Me(this.pos - e, -1)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let i = new ce(t - e);
    return this.oracle.doc.lineAt(e).to == t && (i.flags |= 4), i;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof Me)
      return e;
    let t = new Me(0, -1);
    return this.nodes.push(t), t;
  }
  addBlock(e) {
    this.enterLine();
    let t = e.deco;
    t && t.startSide > 0 && !this.isCovered && this.ensureLine(), this.nodes.push(e), this.writtenTo = this.pos = this.pos + e.length, t && t.endSide > 0 && (this.covering = e);
  }
  addLineDeco(e, t, i) {
    let n = this.ensureLine();
    n.length += i, n.collapsed += i, n.widgetHeight = Math.max(n.widgetHeight, e), n.breaks += t, this.writtenTo = this.pos = this.pos + i;
  }
  finish(e) {
    let t = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(t instanceof Me) && !this.isCovered ? this.nodes.push(new Me(0, -1)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let i = e;
    for (let n of this.nodes)
      n instanceof Me && n.updateHeight(this.oracle, i), i += n ? n.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, i, n) {
    let s = new pl(i, e);
    return z.spans(t, i, n, s, 0), s.finish(i);
  }
}
function Lg(r, e, t) {
  let i = new Ng();
  return z.compare(r, e, t, i, 0), i.changes;
}
class Ng {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, i, n) {
    (e < t || i && i.heightRelevant || n && n.heightRelevant) && bo(e, t, this.changes, 5);
  }
}
function _g(r, e) {
  let t = r.getBoundingClientRect(), i = r.ownerDocument, n = i.defaultView || window, s = Math.max(0, t.left), o = Math.min(n.innerWidth, t.right), l = Math.max(0, t.top), a = Math.min(n.innerHeight, t.bottom);
  for (let h = r.parentNode; h && h != i.body; )
    if (h.nodeType == 1) {
      let c = h, f = window.getComputedStyle(c);
      if ((c.scrollHeight > c.clientHeight || c.scrollWidth > c.clientWidth) && f.overflow != "visible") {
        let d = c.getBoundingClientRect();
        s = Math.max(s, d.left), o = Math.min(o, d.right), l = Math.max(l, d.top), a = h == r.parentNode ? d.bottom : Math.min(a, d.bottom);
      }
      h = f.position == "absolute" || f.position == "fixed" ? c.offsetParent : c.parentNode;
    } else if (h.nodeType == 11)
      h = h.host;
    else
      break;
  return {
    left: s - t.left,
    right: Math.max(s, o) - t.left,
    top: l - (t.top + e),
    bottom: Math.max(l, a) - (t.top + e)
  };
}
function Ug(r, e) {
  let t = r.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class xs {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.size = i;
  }
  static same(e, t) {
    if (e.length != t.length)
      return !1;
    for (let i = 0; i < e.length; i++) {
      let n = e[i], s = t[i];
      if (n.from != s.from || n.to != s.to || n.size != s.size)
        return !1;
    }
    return !0;
  }
  draw(e, t) {
    return R.replace({
      widget: new Ig(this.size * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class Ig extends Qt {
  constructor(e, t) {
    super(), this.size = e, this.vertical = t;
  }
  eq(e) {
    return e.size == this.size && e.vertical == this.vertical;
  }
  toDOM() {
    let e = document.createElement("div");
    return this.vertical ? e.style.height = this.size + "px" : (e.style.width = this.size + "px", e.style.height = "2px", e.style.display = "inline-block"), e;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
}
class oh {
  constructor(e) {
    this.state = e, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scrollTop = 0, this.scrolledToBottom = !1, this.scaleX = 1, this.scaleY = 1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = lh, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = J.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let t = e.facet(ul).some((i) => typeof i != "function" && i.class == "cm-lineWrapping");
    this.heightOracle = new qg(t), this.stateDeco = e.facet(fr).filter((i) => typeof i != "function"), this.heightMap = ke.empty().applyChanges(this.stateDeco, L.empty, this.heightOracle.setDoc(e.doc), [new Ne(0, 0, 0, e.doc.length)]);
    for (let i = 0; i < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); i++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = R.set(this.lineGaps.map((i) => i.draw(this, !1))), this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let n = i ? t.head : t.anchor;
      if (!e.some(({ from: s, to: o }) => n >= s && n <= o)) {
        let { from: s, to: o } = this.lineBlockAt(n);
        e.push(new Gr(s, o));
      }
    }
    return this.viewports = e.sort((i, n) => i.from - n.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? lh : new ml(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Ii(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let i = this.stateDeco;
    this.stateDeco = this.state.facet(fr).filter((c) => typeof c != "function");
    let n = e.changedRanges, s = Ne.extendWithRanges(n, Lg(i, this.stateDeco, e ? e.changes : le.empty(this.state.doc.length))), o = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollTop);
    nh(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), s), (this.heightMap.height != o || ki) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = this.heightMap.height);
    let a = s.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < a.from || t.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, t));
    let h = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, e.flags |= this.updateForViewport(), (h || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && e.selectionSet && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(qf) && (this.mustEnforceCursorAssoc = !0);
  }
  measure(e) {
    let t = e.contentDOM, i = window.getComputedStyle(t), n = this.heightOracle, s = i.whiteSpace;
    this.defaultTextDirection = i.direction == "rtl" ? J.RTL : J.LTR;
    let o = this.heightOracle.mustRefreshForWrapping(s), l = t.getBoundingClientRect(), a = o || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let h = 0, c = 0;
    if (l.width && l.height) {
      let { scaleX: Q, scaleY: x } = uf(t, l);
      (Q > 5e-3 && Math.abs(this.scaleX - Q) > 5e-3 || x > 5e-3 && Math.abs(this.scaleY - x) > 5e-3) && (this.scaleX = Q, this.scaleY = x, h |= 8, o = a = !0);
    }
    let f = (parseInt(i.paddingTop) || 0) * this.scaleY, d = (parseInt(i.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != f || this.paddingBottom != d) && (this.paddingTop = f, this.paddingBottom = d, h |= 10), this.editorWidth != e.scrollDOM.clientWidth && (n.lineWrapping && (a = !0), this.editorWidth = e.scrollDOM.clientWidth, h |= 8);
    let O = e.scrollDOM.scrollTop * this.scaleY;
    this.scrollTop != O && (this.scrollAnchorHeight = -1, this.scrollTop = O), this.scrolledToBottom = pf(e.scrollDOM);
    let p = (this.printing ? Ug : _g)(t, this.paddingTop), m = p.top - this.pixelViewport.top, g = p.bottom - this.pixelViewport.bottom;
    this.pixelViewport = p;
    let b = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (b != this.inView && (this.inView = b, b && (a = !0)), !this.inView && !this.scrollTarget)
      return 0;
    let S = l.width;
    if ((this.contentDOMWidth != S || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, h |= 8), a) {
      let Q = e.docView.measureVisibleLineHeights(this.viewport);
      if (n.mustRefreshForHeights(Q) && (o = !0), o || n.lineWrapping && Math.abs(S - this.contentDOMWidth) > n.charWidth) {
        let { lineHeight: x, charWidth: v, textHeight: $ } = e.docView.measureTextSize();
        o = x > 0 && n.refresh(s, x, v, $, S / v, Q), o && (e.docView.minWidth = 0, h |= 8);
      }
      m > 0 && g > 0 ? c = Math.max(m, g) : m < 0 && g < 0 && (c = Math.min(m, g)), nh();
      for (let x of this.viewports) {
        let v = x.from == this.viewport.from ? Q : e.docView.measureVisibleLineHeights(x);
        this.heightMap = (o ? ke.empty().applyChanges(this.stateDeco, L.empty, this.heightOracle, [new Ne(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(n, 0, o, new Vg(x.from, v));
      }
      ki && (h |= 2);
    }
    let k = !this.viewportIsAppropriate(this.viewport, c) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return k && (h & 2 && (h |= this.updateScaler()), this.viewport = this.getViewport(c, this.scrollTarget), h |= this.updateForViewport()), (h & 2 || k) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(o ? [] : this.lineGaps, e)), h |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), h;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let i = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), n = this.heightMap, s = this.heightOracle, { visibleTop: o, visibleBottom: l } = this, a = new Gr(n.lineAt(o - i * 1e3, K.ByHeight, s, 0, 0).from, n.lineAt(l + (1 - i) * 1e3, K.ByHeight, s, 0, 0).to);
    if (t) {
      let { head: h } = t.range;
      if (h < a.from || h > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), f = n.lineAt(h, K.ByPos, s, 0, 0), d;
        t.y == "center" ? d = (f.top + f.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && h < a.from ? d = f.top : d = f.bottom - c, a = new Gr(n.lineAt(d - 1e3 / 2, K.ByHeight, s, 0, 0).from, n.lineAt(d + c + 1e3 / 2, K.ByHeight, s, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let i = t.mapPos(e.from, -1), n = t.mapPos(e.to, 1);
    return new Gr(this.heightMap.lineAt(i, K.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(n, K.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, i = 0) {
    if (!this.inView)
      return !0;
    let { top: n } = this.heightMap.lineAt(e, K.ByPos, this.heightOracle, 0, 0), { bottom: s } = this.heightMap.lineAt(t, K.ByPos, this.heightOracle, 0, 0), { visibleTop: o, visibleBottom: l } = this;
    return (e == 0 || n <= o - Math.max(10, Math.min(
      -i,
      250
      /* VP.MaxCoverMargin */
    ))) && (t == this.state.doc.length || s >= l + Math.max(10, Math.min(
      i,
      250
      /* VP.MaxCoverMargin */
    ))) && n > o - 2 * 1e3 && s < l + 2 * 1e3;
  }
  mapLineGaps(e, t) {
    if (!e.length || t.empty)
      return e;
    let i = [];
    for (let n of e)
      t.touchesRange(n.from, n.to) || i.push(new xs(t.mapPos(n.from), t.mapPos(n.to), n.size));
    return i;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(e, t) {
    let i = this.heightOracle.lineWrapping, n = i ? 1e4 : 2e3, s = n >> 1, o = n << 1;
    if (this.defaultTextDirection != J.LTR && !i)
      return [];
    let l = [], a = (c, f, d, O) => {
      if (f - c < s)
        return;
      let p = this.state.selection.main, m = [p.from];
      p.empty || m.push(p.to);
      for (let b of m)
        if (b > c && b < f) {
          a(c, b - 10, d, O), a(b + 10, f, d, O);
          return;
        }
      let g = Gg(e, (b) => b.from >= d.from && b.to <= d.to && Math.abs(b.from - c) < s && Math.abs(b.to - f) < s && !m.some((S) => b.from < S && b.to > S));
      if (!g) {
        if (f < d.to && t && i && t.visibleRanges.some((b) => b.from <= f && b.to >= f)) {
          let b = t.moveToLineBoundary(y.cursor(f), !1, !0).head;
          b > c && (f = b);
        }
        g = new xs(c, f, this.gapSize(d, c, f, O));
      }
      l.push(g);
    }, h = (c) => {
      if (c.length < o || c.type != xe.Text)
        return;
      let f = jg(c.from, c.to, this.stateDeco);
      if (f.total < o)
        return;
      let d = this.scrollTarget ? this.scrollTarget.range.head : null, O, p;
      if (i) {
        let m = n / this.heightOracle.lineLength * this.heightOracle.lineHeight, g, b;
        if (d != null) {
          let S = Hr(f, d), k = ((this.visibleBottom - this.visibleTop) / 2 + m) / c.height;
          g = S - k, b = S + k;
        } else
          g = (this.visibleTop - c.top - m) / c.height, b = (this.visibleBottom - c.top + m) / c.height;
        O = Fr(f, g), p = Fr(f, b);
      } else {
        let m = f.total * this.heightOracle.charWidth, g = n * this.heightOracle.charWidth, b, S;
        if (d != null) {
          let k = Hr(f, d), Q = ((this.pixelViewport.right - this.pixelViewport.left) / 2 + g) / m;
          b = k - Q, S = k + Q;
        } else
          b = (this.pixelViewport.left - g) / m, S = (this.pixelViewport.right + g) / m;
        O = Fr(f, b), p = Fr(f, S);
      }
      O > c.from && a(c.from, O, c, f), p < c.to && a(p, c.to, c, f);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(h) : h(c);
    return l;
  }
  gapSize(e, t, i, n) {
    let s = Hr(n, i) - Hr(n, t);
    return this.heightOracle.lineWrapping ? e.height * s : n.total * this.heightOracle.charWidth * s;
  }
  updateLineGaps(e) {
    xs.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = R.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges() {
    let e = this.stateDeco;
    this.lineGaps.length && (e = e.concat(this.lineGapDeco));
    let t = [];
    z.spans(e, this.viewport.from, this.viewport.to, {
      span(n, s) {
        t.push({ from: n, to: s });
      },
      point() {
      }
    }, 20);
    let i = t.length != this.visibleRanges.length || this.visibleRanges.some((n, s) => n.from != t[s].from || n.to != t[s].to);
    return this.visibleRanges = t, i ? 4 : 0;
  }
  lineBlockAt(e) {
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Ii(this.heightMap.lineAt(e, K.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Ii(this.heightMap.lineAt(this.scaler.fromDOM(e), K.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Ii(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class Gr {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function jg(r, e, t) {
  let i = [], n = r, s = 0;
  return z.spans(t, r, e, {
    span() {
    },
    point(o, l) {
      o > n && (i.push({ from: n, to: o }), s += o - n), n = l;
    }
  }, 20), n < e && (i.push({ from: n, to: e }), s += e - n), { total: s, ranges: i };
}
function Fr({ total: r, ranges: e }, t) {
  if (t <= 0)
    return e[0].from;
  if (t >= 1)
    return e[e.length - 1].to;
  let i = Math.floor(r * t);
  for (let n = 0; ; n++) {
    let { from: s, to: o } = e[n], l = o - s;
    if (i <= l)
      return s + i;
    i -= l;
  }
}
function Hr(r, e) {
  let t = 0;
  for (let { from: i, to: n } of r.ranges) {
    if (e <= n) {
      t += e - i;
      break;
    }
    t += n - i;
  }
  return t / r.total;
}
function Gg(r, e) {
  for (let t of r)
    if (e(t))
      return t;
}
const lh = {
  toDOM(r) {
    return r;
  },
  fromDOM(r) {
    return r;
  },
  scale: 1,
  eq(r) {
    return r == this;
  }
};
class ml {
  constructor(e, t, i) {
    let n = 0, s = 0, o = 0;
    this.viewports = i.map(({ from: l, to: a }) => {
      let h = t.lineAt(l, K.ByPos, e, 0, 0).top, c = t.lineAt(a, K.ByPos, e, 0, 0).bottom;
      return n += c - h, { from: l, to: a, top: h, bottom: c, domTop: 0, domBottom: 0 };
    }), this.scale = (7e6 - n) / (t.height - n);
    for (let l of this.viewports)
      l.domTop = o + (l.top - s) * this.scale, o = l.domBottom = l.domTop + (l.bottom - l.top), s = l.bottom;
  }
  toDOM(e) {
    for (let t = 0, i = 0, n = 0; ; t++) {
      let s = t < this.viewports.length ? this.viewports[t] : null;
      if (!s || e < s.top)
        return n + (e - i) * this.scale;
      if (e <= s.bottom)
        return s.domTop + (e - s.top);
      i = s.bottom, n = s.domBottom;
    }
  }
  fromDOM(e) {
    for (let t = 0, i = 0, n = 0; ; t++) {
      let s = t < this.viewports.length ? this.viewports[t] : null;
      if (!s || e < s.domTop)
        return i + (e - n) / this.scale;
      if (e <= s.domBottom)
        return s.top + (e - s.domTop);
      i = s.bottom, n = s.domBottom;
    }
  }
  eq(e) {
    return e instanceof ml ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, i) => t.from == e.viewports[i].from && t.to == e.viewports[i].to) : !1;
  }
}
function Ii(r, e) {
  if (e.scale == 1)
    return r;
  let t = e.toDOM(r.top), i = e.toDOM(r.bottom);
  return new ot(r.from, r.length, t, i - t, Array.isArray(r._content) ? r._content.map((n) => Ii(n, e)) : r._content);
}
const Kr = /* @__PURE__ */ T.define({ combine: (r) => r.join(" ") }), $o = /* @__PURE__ */ T.define({ combine: (r) => r.indexOf(!0) > -1 }), vo = /* @__PURE__ */ Wt.newName(), su = /* @__PURE__ */ Wt.newName(), ou = /* @__PURE__ */ Wt.newName(), lu = { "&light": "." + su, "&dark": "." + ou };
function Co(r, e, t) {
  return new Wt(e, {
    finish(i) {
      return /&/.test(i) ? i.replace(/&\w*/, (n) => {
        if (n == "&")
          return r;
        if (!t || !t[n])
          throw new RangeError(`Unsupported selector: ${n}`);
        return t[n];
      }) : r + " " + i;
    }
  });
}
const Fg = /* @__PURE__ */ Co("." + vo, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      // Provide a simple default outline to make sure a focused
      // editor is visually distinct. Can't leave the default behavior
      // because that will apply to the content element, which is
      // inside the scrollable container and doesn't include the
      // gutters. We also can't use an 'auto' outline, since those
      // are, for some reason, drawn behind the element content, which
      // will cause things like the active line background to cover
      // the outline (#297).
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    // https://github.com/codemirror/dev/issues/456
    boxSizing: "border-box",
    minHeight: "100%",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    // For IE
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    // For Safari, which doesn't support overflow-wrap: anywhere
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    position: "absolute",
    left: 0,
    top: 0,
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#444"
  },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
    display: "block"
  },
  ".cm-iso": {
    unicodeBidi: "isolate"
  },
  ".cm-announced": {
    position: "fixed",
    top: "-10000px"
  },
  "@media print": {
    ".cm-announced": { display: "none" }
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    insetInlineStart: 0,
    zIndex: 200
  },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    borderRight: "1px solid #ddd"
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    // Necessary -- prevents margin collapsing
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top"
  },
  ".cm-highlightSpace:before": {
    content: "attr(data-display)",
    position: "absolute",
    pointerEvents: "none",
    color: "#888"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, lu), Hg = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, ks = Z.ie && Z.ie_version <= 11;
class Kg {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new Wm(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let i of t)
        this.queue.push(i);
      (Z.ie && Z.ie_version <= 11 || Z.ios && e.composing) && t.some((i) => i.type == "childList" && i.removedNodes.length || i.type == "characterData" && i.oldValue.length > i.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(Z.chrome && Z.chrome_version < 126) && (this.editContext = new e0(e), e.state.facet(vt) && (e.contentDOM.editContext = this.editContext.editContext)), ks && (this.onCharData = (t) => {
      this.queue.push({
        target: t.target,
        type: "characterData",
        oldValue: t.prevValue
      }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this), this.onResize = this.onResize.bind(this), this.onPrint = this.onPrint.bind(this), this.onScroll = this.onScroll.bind(this), window.matchMedia && (this.printQuery = window.matchMedia("print")), typeof ResizeObserver == "function" && (this.resizeScroll = new ResizeObserver(() => {
      var t;
      ((t = this.view.docView) === null || t === void 0 ? void 0 : t.lastUpdate) < Date.now() - 75 && this.onResize();
    }), this.resizeScroll.observe(e.scrollDOM)), this.addWindowListeners(this.win = e.win), this.start(), typeof IntersectionObserver == "function" && (this.intersection = new IntersectionObserver((t) => {
      this.parentCheck < 0 && (this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3)), t.length > 0 && t[t.length - 1].intersectionRatio > 0 != this.intersecting && (this.intersecting = !this.intersecting, this.intersecting != this.view.inView && this.onScrollChanged(document.createEvent("Event")));
    }, { threshold: [0, 1e-3] }), this.intersection.observe(this.dom), this.gapIntersection = new IntersectionObserver((t) => {
      t.length > 0 && t[t.length - 1].intersectionRatio > 0 && this.onScrollChanged(document.createEvent("Event"));
    }, {})), this.listenForScroll(), this.readSelectionRange();
  }
  onScrollChanged(e) {
    this.view.inputState.runHandlers("scroll", e), this.intersecting && this.view.measure();
  }
  onScroll(e) {
    this.intersecting && this.flush(!1), this.editContext && this.view.requestMeasure(this.editContext.measureReq), this.onScrollChanged(e);
  }
  onResize() {
    this.resizeTimeout < 0 && (this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = -1, this.view.requestMeasure();
    }, 50));
  }
  onPrint(e) {
    (e.type == "change" || !e.type) && !e.matches || (this.view.viewState.printing = !0, this.view.measure(), setTimeout(() => {
      this.view.viewState.printing = !1, this.view.requestMeasure();
    }, 500));
  }
  updateGaps(e) {
    if (this.gapIntersection && (e.length != this.gaps.length || this.gaps.some((t, i) => t != e[i]))) {
      this.gapIntersection.disconnect();
      for (let t of e)
        this.gapIntersection.observe(t);
      this.gaps = e;
    }
  }
  onSelectionChange(e) {
    let t = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view: i } = this, n = this.selectionRange;
    if (i.state.facet(vt) ? i.root.activeElement != this.dom : !mn(i.dom, n))
      return;
    let s = n.anchorNode && i.docView.nearest(n.anchorNode);
    if (s && s.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (Z.ie && Z.ie_version <= 11 || Z.android && Z.chrome) && !i.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    n.focusNode && Hi(n.focusNode, n.focusOffset, n.anchorNode, n.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = hr(e.root);
    if (!t)
      return !1;
    let i = Z.safari && e.root.nodeType == 11 && Rm(this.dom.ownerDocument) == this.dom && Jg(this.view, t) || t;
    if (!i || this.selectionRange.eq(i))
      return !1;
    let n = mn(this.dom, i);
    return n && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && Dm(this.dom, i) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(i), n && (this.selectionChanged = !0), !0);
  }
  setSelectionRange(e, t) {
    this.selectionRange.set(e.node, e.offset, t.node, t.offset), this.selectionChanged = !1;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let e = 0, t = null;
    for (let i = this.dom; i; )
      if (i.nodeType == 1)
        !t && e < this.scrollTargets.length && this.scrollTargets[e] == i ? e++ : t || (t = this.scrollTargets.slice(0, e)), t && t.push(i), i = i.assignedSlot || i.parentNode;
      else if (i.nodeType == 11)
        i = i.host;
      else
        break;
    if (e < this.scrollTargets.length && !t && (t = this.scrollTargets.slice(0, e)), t) {
      for (let i of this.scrollTargets)
        i.removeEventListener("scroll", this.onScroll);
      for (let i of this.scrollTargets = t)
        i.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(e) {
    if (!this.active)
      return e();
    try {
      return this.stop(), e();
    } finally {
      this.start(), this.clear();
    }
  }
  start() {
    this.active || (this.observer.observe(this.dom, Hg), ks && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), ks && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
  }
  // Throw away any pending changes
  clear() {
    this.processRecords(), this.queue.length = 0, this.selectionChanged = !1;
  }
  // Chrome Android, especially in combination with GBoard, not only
  // doesn't reliably fire regular key events, but also often
  // surrounds the effect of enter or backspace with a bunch of
  // composition events that, when interrupted, cause text duplication
  // or other kinds of corruption. This hack makes the editor back off
  // from handling DOM changes for a moment when such a key is
  // detected (via beforeinput or keydown), and then tries to flush
  // them or, if that has no effect, dispatches the given key.
  delayAndroidKey(e, t) {
    var i;
    if (!this.delayedAndroidKey) {
      let n = () => {
        let s = this.delayedAndroidKey;
        s && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = s.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && s.force && Oi(this.dom, s.key, s.keyCode));
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(n);
    }
    (!this.delayedAndroidKey || e == "Enter") && (this.delayedAndroidKey = {
      key: e,
      keyCode: t,
      // Only run the key handler when no changes are detected if
      // this isn't coming right after another change, in which case
      // it is probably part of a weird chain of updates, and should
      // be ignored if it returns the DOM to its previous state.
      force: this.lastChange < Date.now() - 50 || !!(!((i = this.delayedAndroidKey) === null || i === void 0) && i.force)
    });
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey), this.delayedAndroidKey = null, this.flushingAndroidKey = -1;
  }
  flushSoon() {
    this.delayedFlush < 0 && (this.delayedFlush = this.view.win.requestAnimationFrame(() => {
      this.delayedFlush = -1, this.flush();
    }));
  }
  forceFlush() {
    this.delayedFlush >= 0 && (this.view.win.cancelAnimationFrame(this.delayedFlush), this.delayedFlush = -1), this.flush();
  }
  pendingRecords() {
    for (let e of this.observer.takeRecords())
      this.queue.push(e);
    return this.queue;
  }
  processRecords() {
    let e = this.pendingRecords();
    e.length && (this.queue = []);
    let t = -1, i = -1, n = !1;
    for (let s of e) {
      let o = this.readMutation(s);
      o && (o.typeOver && (n = !0), t == -1 ? { from: t, to: i } = o : (t = Math.min(o.from, t), i = Math.max(o.to, i)));
    }
    return { from: t, to: i, typeOver: n };
  }
  readChange() {
    let { from: e, to: t, typeOver: i } = this.processRecords(), n = this.selectionChanged && mn(this.dom, this.selectionRange);
    if (e < 0 && !n)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let s = new gg(this.view, e, t, i);
    return this.view.docView.domChanged = { newSel: s.newSel ? s.newSel.main : null }, s;
  }
  // Apply pending changes, if any
  flush(e = !0) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return !1;
    e && this.readSelectionRange();
    let t = this.readChange();
    if (!t)
      return this.view.requestMeasure(), !1;
    let i = this.view.state, n = Gf(this.view, t);
    return this.view.state == i && (t.domChanged || t.newSel && !t.newSel.main.eq(this.view.state.selection.main)) && this.view.update([]), n;
  }
  readMutation(e) {
    let t = this.view.docView.nearest(e.target);
    if (!t || t.ignoreMutation(e))
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "attributes" && (t.flags |= 4), e.type == "childList") {
      let i = ah(t, e.previousSibling || e.target.previousSibling, -1), n = ah(t, e.nextSibling || e.target.nextSibling, 1);
      return {
        from: i ? t.posAfter(i) : t.posAtStart,
        to: n ? t.posBefore(n) : t.posAtEnd,
        typeOver: !1
      };
    } else return e.type == "characterData" ? { from: t.posAtStart, to: t.posAtEnd, typeOver: e.target.nodeValue == e.oldValue } : null;
  }
  setWindow(e) {
    e != this.win && (this.removeWindowListeners(this.win), this.win = e, this.addWindowListeners(this.win));
  }
  addWindowListeners(e) {
    e.addEventListener("resize", this.onResize), this.printQuery ? this.printQuery.addEventListener ? this.printQuery.addEventListener("change", this.onPrint) : this.printQuery.addListener(this.onPrint) : e.addEventListener("beforeprint", this.onPrint), e.addEventListener("scroll", this.onScroll), e.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(e) {
    e.removeEventListener("scroll", this.onScroll), e.removeEventListener("resize", this.onResize), this.printQuery ? this.printQuery.removeEventListener ? this.printQuery.removeEventListener("change", this.onPrint) : this.printQuery.removeListener(this.onPrint) : e.removeEventListener("beforeprint", this.onPrint), e.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  update(e) {
    this.editContext && (this.editContext.update(e), e.startState.facet(vt) != e.state.facet(vt) && (e.view.contentDOM.editContext = e.state.facet(vt) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, i;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (i = this.resizeScroll) === null || i === void 0 || i.disconnect();
    for (let n of this.scrollTargets)
      n.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function ah(r, e, t) {
  for (; e; ) {
    let i = j.get(e);
    if (i && i.parent == r)
      return i;
    let n = e.parentNode;
    e = n != r.dom ? n : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function hh(r, e) {
  let t = e.startContainer, i = e.startOffset, n = e.endContainer, s = e.endOffset, o = r.docView.domAtPos(r.state.selection.main.anchor);
  return Hi(o.node, o.offset, n, s) && ([t, i, n, s] = [n, s, t, i]), { anchorNode: t, anchorOffset: i, focusNode: n, focusOffset: s };
}
function Jg(r, e) {
  if (e.getComposedRanges) {
    let n = e.getComposedRanges(r.root)[0];
    if (n)
      return hh(r, n);
  }
  let t = null;
  function i(n) {
    n.preventDefault(), n.stopImmediatePropagation(), t = n.getTargetRanges()[0];
  }
  return r.contentDOM.addEventListener("beforeinput", i, !0), r.dom.ownerDocument.execCommand("indent"), r.contentDOM.removeEventListener("beforeinput", i, !0), t ? hh(r, t) : null;
}
class e0 {
  constructor(e) {
    this.from = 0, this.to = 0, this.pendingContextChange = null, this.handlers = /* @__PURE__ */ Object.create(null), this.resetRange(e.state);
    let t = this.editContext = new window.EditContext({
      text: e.state.doc.sliceString(this.from, this.to),
      selectionStart: this.toContextPos(Math.max(this.from, Math.min(this.to, e.state.selection.main.anchor))),
      selectionEnd: this.toContextPos(e.state.selection.main.head)
    });
    this.handlers.textupdate = (i) => {
      let { anchor: n } = e.state.selection.main, s = {
        from: this.toEditorPos(i.updateRangeStart),
        to: this.toEditorPos(i.updateRangeEnd),
        insert: L.of(i.text.split(`
`))
      };
      s.from == this.from && n < this.from ? s.from = n : s.to == this.to && n > this.to && (s.to = n), !(s.from == s.to && !s.insert.length) && (this.pendingContextChange = s, e.state.readOnly || Ol(e, s, y.single(this.toEditorPos(i.selectionStart), this.toEditorPos(i.selectionEnd))), this.pendingContextChange && (this.revertPending(e.state), this.setSelection(e.state)));
    }, this.handlers.characterboundsupdate = (i) => {
      let n = [], s = null;
      for (let o = this.toEditorPos(i.rangeStart), l = this.toEditorPos(i.rangeEnd); o < l; o++) {
        let a = e.coordsForChar(o);
        s = a && new DOMRect(a.left, a.top, a.right - a.left, a.bottom - a.top) || s || new DOMRect(), n.push(s);
      }
      t.updateCharacterBounds(i.rangeStart, n);
    }, this.handlers.textformatupdate = (i) => {
      let n = [];
      for (let s of i.getTextFormats()) {
        let o = s.underlineStyle, l = s.underlineThickness;
        if (o != "None" && l != "None") {
          let a = `text-decoration: underline ${o == "Dashed" ? "dashed " : o == "Squiggle" ? "wavy " : ""}${l == "Thin" ? 1 : 2}px`;
          n.push(R.mark({ attributes: { style: a } }).range(this.toEditorPos(s.rangeStart), this.toEditorPos(s.rangeEnd)));
        }
      }
      e.dispatch({ effects: Bf.of(R.set(n)) });
    }, this.handlers.compositionstart = () => {
      e.inputState.composing < 0 && (e.inputState.composing = 0, e.inputState.compositionFirstChange = !0);
    }, this.handlers.compositionend = () => {
      e.inputState.composing = -1, e.inputState.compositionFirstChange = null;
    };
    for (let i in this.handlers)
      t.addEventListener(i, this.handlers[i]);
    this.measureReq = { read: (i) => {
      this.editContext.updateControlBounds(i.contentDOM.getBoundingClientRect());
      let n = hr(i.root);
      n && n.rangeCount && this.editContext.updateSelectionBounds(n.getRangeAt(0).getBoundingClientRect());
    } };
  }
  applyEdits(e) {
    let t = 0, i = !1, n = this.pendingContextChange;
    return e.changes.iterChanges((s, o, l, a, h) => {
      if (i)
        return;
      let c = h.length - (o - s);
      if (n && o >= n.to)
        if (n.from == s && n.to == o && n.insert.eq(h)) {
          n = this.pendingContextChange = null, t += c, this.to += c;
          return;
        } else
          n = null, this.revertPending(e.state);
      if (s += t, o += t, o <= this.from)
        this.from += c, this.to += c;
      else if (s < this.to) {
        if (s < this.from || o > this.to || this.to - this.from + h.length > 3e4) {
          i = !0;
          return;
        }
        this.editContext.updateText(this.toContextPos(s), this.toContextPos(o), h.toString()), this.to += c;
      }
      t += c;
    }), n && !i && this.revertPending(e.state), !i;
  }
  update(e) {
    let t = this.pendingContextChange;
    !this.applyEdits(e) || !this.rangeIsValid(e.state) ? (this.pendingContextChange = null, this.resetRange(e.state), this.editContext.updateText(0, this.editContext.text.length, e.state.doc.sliceString(this.from, this.to)), this.setSelection(e.state)) : (e.docChanged || e.selectionSet || t) && this.setSelection(e.state), (e.geometryChanged || e.docChanged || e.selectionSet) && e.view.requestMeasure(this.measureReq);
  }
  resetRange(e) {
    let { head: t } = e.selection.main;
    this.from = Math.max(
      0,
      t - 1e4
      /* CxVp.Margin */
    ), this.to = Math.min(
      e.doc.length,
      t + 1e4
      /* CxVp.Margin */
    );
  }
  revertPending(e) {
    let t = this.pendingContextChange;
    this.pendingContextChange = null, this.editContext.updateText(this.toContextPos(t.from), this.toContextPos(t.from + t.insert.length), e.doc.sliceString(t.from, t.to));
  }
  setSelection(e) {
    let { main: t } = e.selection, i = this.toContextPos(Math.max(this.from, Math.min(this.to, t.anchor))), n = this.toContextPos(t.head);
    (this.editContext.selectionStart != i || this.editContext.selectionEnd != n) && this.editContext.updateSelection(i, n);
  }
  rangeIsValid(e) {
    let { head: t } = e.selection.main;
    return !(this.from > 0 && t - this.from < 500 || this.to < e.doc.length && this.to - t < 500 || this.to - this.from > 1e4 * 3);
  }
  toEditorPos(e) {
    return e + this.from;
  }
  toContextPos(e) {
    return e - this.from;
  }
  destroy() {
    for (let e in this.handlers)
      this.editContext.removeEventListener(e, this.handlers[e]);
  }
}
class C {
  /**
  The current editor state.
  */
  get state() {
    return this.viewState.state;
  }
  /**
  To be able to display large documents without consuming too much
  memory or overloading the browser, CodeMirror only draws the
  code that is visible (plus a margin around it) to the DOM. This
  property tells you the extent of the current drawn viewport, in
  document positions.
  */
  get viewport() {
    return this.viewState.viewport;
  }
  /**
  When there are, for example, large collapsed ranges in the
  viewport, its size can be a lot bigger than the actual visible
  content. Thus, if you are doing something like styling the
  content in the viewport, it is preferable to only do so for
  these ranges, which are the subset of the viewport that is
  actually drawn.
  */
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  /**
  Returns false when the editor is entirely scrolled out of view
  or otherwise hidden.
  */
  get inView() {
    return this.viewState.inView;
  }
  /**
  Indicates whether the user is currently composing text via
  [IME](https://en.wikipedia.org/wiki/Input_method), and at least
  one change has been made in the current composition.
  */
  get composing() {
    return this.inputState.composing > 0;
  }
  /**
  Indicates whether the user is currently in composing state. Note
  that on some platforms, like Android, this will be the case a
  lot, since just putting the cursor on a word starts a
  composition there.
  */
  get compositionStarted() {
    return this.inputState.composing >= 0;
  }
  /**
  The document or shadow root that the view lives in.
  */
  get root() {
    return this._root;
  }
  /**
  @internal
  */
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  /**
  Construct a new view. You'll want to either provide a `parent`
  option, or put `view.dom` into your document after creating a
  view, so that the user can see the editor.
  */
  constructor(e = {}) {
    this.plugins = [], this.pluginMap = /* @__PURE__ */ new Map(), this.editorAttrs = {}, this.contentAttrs = {}, this.bidiCache = [], this.destroyed = !1, this.updateState = 2, this.measureScheduled = -1, this.measureRequests = [], this.contentDOM = document.createElement("div"), this.scrollDOM = document.createElement("div"), this.scrollDOM.tabIndex = -1, this.scrollDOM.className = "cm-scroller", this.scrollDOM.appendChild(this.contentDOM), this.announceDOM = document.createElement("div"), this.announceDOM.className = "cm-announced", this.announceDOM.setAttribute("aria-live", "polite"), this.dom = document.createElement("div"), this.dom.appendChild(this.announceDOM), this.dom.appendChild(this.scrollDOM), e.parent && e.parent.appendChild(this.dom);
    let { dispatch: t } = e;
    this.dispatchTransactions = e.dispatchTransactions || t && ((i) => i.forEach((n) => t(n, this))) || ((i) => this.update(i)), this.dispatch = this.dispatch.bind(this), this._root = e.root || Ym(e.parent) || document, this.viewState = new oh(e.state || B.create(e)), e.scrollTo && e.scrollTo.is(Ur) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(Ni).map((i) => new bs(i));
    for (let i of this.plugins)
      i.update(this);
    this.observer = new Kg(this), this.inputState = new kg(this), this.inputState.ensureHandlers(this.plugins), this.docView = new Va(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure();
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof ne ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
    this.dispatchTransactions(t, this);
  }
  /**
  Update the view for the given array of transactions. This will
  update the visible document and selection to match the state
  produced by the transactions, and notify view plugins of the
  change. You should usually call
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
  as a primitive.
  */
  update(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let t = !1, i = !1, n, s = this.state;
    for (let d of e) {
      if (d.startState != s)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      s = d.state;
    }
    if (this.destroyed) {
      this.viewState.state = s;
      return;
    }
    let o = this.hasFocus, l = 0, a = null;
    e.some((d) => d.annotation(tu)) ? (this.inputState.notifiedFocused = o, l = 1) : o != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = o, a = iu(s, o), a || (l = 1));
    let h = this.observer.delayedAndroidKey, c = null;
    if (h ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(s.doc) || !this.state.selection.eq(s.selection)) && (c = null)) : this.observer.clear(), s.facet(B.phrases) != this.state.facet(B.phrases))
      return this.setState(s);
    n = En.create(this, s, e), n.flags |= l;
    let f = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let d of e) {
        if (f && (f = f.map(d.changes)), d.scrollIntoView) {
          let { main: O } = d.state.selection;
          f = new pi(O.empty ? O : y.cursor(O.head, O.head > O.anchor ? -1 : 1));
        }
        for (let O of d.effects)
          O.is(Ur) && (f = O.value.clip(this.state));
      }
      this.viewState.update(n, f), this.bidiCache = Yn.update(this.bidiCache, n.changes), n.empty || (this.updatePlugins(n), this.inputState.update(n)), t = this.docView.update(n), this.state.facet(_i) != this.styleModules && this.mountStyles(), i = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((d) => d.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (n.startState.facet(Kr) != n.state.facet(Kr) && (this.viewState.mustMeasureContent = !0), (t || i || f || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !n.empty)
      for (let d of this.state.facet(ko))
        try {
          d(n);
        } catch (O) {
          Ce(this.state, O, "update listener");
        }
    (a || c) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), c && !Gf(this, c) && h.force && Oi(this.contentDOM, h.key, h.keyCode);
    });
  }
  /**
  Reset the view to the given state. (This will cause the entire
  document to be redrawn and all view plugins to be reinitialized,
  so you should probably only use it when the new state isn't
  derived from the old state. Otherwise, use
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
  */
  setState(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = e;
      return;
    }
    this.updateState = 2;
    let t = this.hasFocus;
    try {
      for (let i of this.plugins)
        i.destroy(this);
      this.viewState = new oh(e), this.plugins = e.facet(Ni).map((i) => new bs(i)), this.pluginMap.clear();
      for (let i of this.plugins)
        i.update(this);
      this.docView.destroy(), this.docView = new Va(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(Ni), i = e.state.facet(Ni);
    if (t != i) {
      let n = [];
      for (let s of i) {
        let o = t.indexOf(s);
        if (o < 0)
          n.push(new bs(s));
        else {
          let l = this.plugins[o];
          l.mustUpdate = e, n.push(l);
        }
      }
      for (let s of this.plugins)
        s.mustUpdate != e && s.destroy(this);
      this.plugins = n, this.pluginMap.clear();
    } else
      for (let n of this.plugins)
        n.mustUpdate = e;
    for (let n = 0; n < this.plugins.length; n++)
      this.plugins[n].update(this);
    t != i && this.inputState.ensureHandlers(this.plugins);
  }
  docViewUpdate() {
    for (let e of this.plugins) {
      let t = e.value;
      if (t && t.docViewUpdate)
        try {
          t.docViewUpdate(this);
        } catch (i) {
          Ce(this.state, i, "doc view update listener");
        }
    }
  }
  /**
  @internal
  */
  measure(e = !0) {
    if (this.destroyed)
      return;
    if (this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.observer.delayedAndroidKey) {
      this.measureScheduled = -1, this.requestMeasure();
      return;
    }
    this.measureScheduled = 0, e && this.observer.forceFlush();
    let t = null, i = this.scrollDOM, n = i.scrollTop * this.scaleY, { scrollAnchorPos: s, scrollAnchorHeight: o } = this.viewState;
    Math.abs(n - this.viewState.scrollTop) > 1 && (o = -1), this.viewState.scrollAnchorHeight = -1;
    try {
      for (let l = 0; ; l++) {
        if (o < 0)
          if (pf(i))
            s = -1, o = this.viewState.heightMap.height;
          else {
            let O = this.viewState.scrollAnchorAt(n);
            s = O.from, o = O.top;
          }
        this.updateState = 1;
        let a = this.viewState.measure(this);
        if (!a && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (l > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let h = [];
        a & 4 || ([this.measureRequests, h] = [h, this.measureRequests]);
        let c = h.map((O) => {
          try {
            return O.read(this);
          } catch (p) {
            return Ce(this.state, p), ch;
          }
        }), f = En.create(this, this.state, []), d = !1;
        f.flags |= a, t ? t.flags |= a : t = f, this.updateState = 2, f.empty || (this.updatePlugins(f), this.inputState.update(f), this.updateAttrs(), d = this.docView.update(f), d && this.docViewUpdate());
        for (let O = 0; O < h.length; O++)
          if (c[O] != ch)
            try {
              let p = h[O];
              p.write && p.write(c[O], this);
            } catch (p) {
              Ce(this.state, p);
            }
        if (d && this.docView.updateSelection(!0), !f.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, o = -1;
              continue;
            } else {
              let p = (s < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(s).top) - o;
              if (p > 1 || p < -1) {
                n = n + p, i.scrollTop = n / this.scaleY, o = -1;
                continue;
              }
            }
          break;
        }
      }
    } finally {
      this.updateState = 0, this.measureScheduled = -1;
    }
    if (t && !t.empty)
      for (let l of this.state.facet(ko))
        l(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return vo + " " + (this.state.facet($o) ? ou : su) + " " + this.state.facet(Kr);
  }
  updateAttrs() {
    let e = fh(this, zf, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      translate: "no",
      contenteditable: this.state.facet(vt) ? "true" : "false",
      class: "cm-content",
      style: `${Z.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), fh(this, ul, t);
    let i = this.observer.ignore(() => {
      let n = go(this.contentDOM, this.contentAttrs, t), s = go(this.dom, this.editorAttrs, e);
      return n || s;
    });
    return this.editorAttrs = e, this.contentAttrs = t, i;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let i of e)
      for (let n of i.effects)
        if (n.is(C.announce)) {
          t && (this.announceDOM.textContent = ""), t = !1;
          let s = this.announceDOM.appendChild(document.createElement("div"));
          s.textContent = n.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(_i);
    let e = this.state.facet(C.cspNonce);
    Wt.mount(this.root, this.styleModules.concat(Fg).reverse(), e ? { nonce: e } : void 0);
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    this.updateState == 0 && this.measureScheduled > -1 && this.measure(!1);
  }
  /**
  Schedule a layout measurement, optionally providing callbacks to
  do custom DOM measuring followed by a DOM write phase. Using
  this is preferable reading DOM layout directly from, for
  example, an event handler, because it'll make sure measuring and
  drawing done by other components is synchronized, avoiding
  unnecessary DOM layout computations.
  */
  requestMeasure(e) {
    if (this.measureScheduled < 0 && (this.measureScheduled = this.win.requestAnimationFrame(() => this.measure())), e) {
      if (this.measureRequests.indexOf(e) > -1)
        return;
      if (e.key != null) {
        for (let t = 0; t < this.measureRequests.length; t++)
          if (this.measureRequests[t].key === e.key) {
            this.measureRequests[t] = e;
            return;
          }
      }
      this.measureRequests.push(e);
    }
  }
  /**
  Get the value of a specific plugin, if present. Note that
  plugins that crash can be dropped from a view, so even when you
  know you registered a given plugin, it is recommended to check
  the return value of this method.
  */
  plugin(e) {
    let t = this.pluginMap.get(e);
    return (t === void 0 || t && t.spec != e) && this.pluginMap.set(e, t = this.plugins.find((i) => i.spec == e) || null), t && t.update(this).value;
  }
  /**
  The top position of the document, in screen coordinates. This
  may be negative when the editor is scrolled down. Points
  directly to the top of the first line, not above the padding.
  */
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  /**
  Reports the padding above and below the document.
  */
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  /**
  If the editor is transformed with CSS, this provides the scale
  along the X axis. Otherwise, it will just be 1. Note that
  transforms other than translation and scaling are not supported.
  */
  get scaleX() {
    return this.viewState.scaleX;
  }
  /**
  Provide the CSS transformed scale along the Y axis.
  */
  get scaleY() {
    return this.viewState.scaleY;
  }
  /**
  Find the text line or block widget at the given vertical
  position (which is interpreted as relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
  */
  elementAtHeight(e) {
    return this.readMeasured(), this.viewState.elementAtHeight(e);
  }
  /**
  Find the line block (see
  [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) at the given
  height, again interpreted relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
  */
  lineBlockAtHeight(e) {
    return this.readMeasured(), this.viewState.lineBlockAtHeight(e);
  }
  /**
  Get the extent and vertical position of all [line
  blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
  are relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
  */
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  /**
  Find the line block around the given document position. A line
  block is a range delimited on both sides by either a
  non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line breaks, or the
  start/end of the document. It will usually just hold a line of
  text, but may be broken into multiple textblocks by block
  widgets.
  */
  lineBlockAt(e) {
    return this.viewState.lineBlockAt(e);
  }
  /**
  The editor's total content height.
  */
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  /**
  Move a cursor position by [grapheme
  cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
  the motion is away from the line start, or towards it. In
  bidirectional text, the line is traversed in visual order, using
  the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
  When the start position was the last one on the line, the
  returned position will be across the line break. If there is no
  further line, the original position is returned.
  
  By default, this method moves over a single cluster. The
  optional `by` argument can be used to move across more. It will
  be called with the first cluster as argument, and should return
  a predicate that determines, for each subsequent cluster,
  whether it should also be moved over.
  */
  moveByChar(e, t, i) {
    return ys(this, e, Ua(this, e, t, i));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return ys(this, e, Ua(this, e, t, (i) => dg(this, e.head, i)));
  }
  /**
  Get the cursor position visually at the start or end of a line.
  Note that this may differ from the _logical_ position at its
  start or end (which is simply at `line.from`/`line.to`) if text
  at the start or end goes against the line's base text direction.
  */
  visualLineSide(e, t) {
    let i = this.bidiSpans(e), n = this.textDirectionAt(e.from), s = i[t ? i.length - 1 : 0];
    return y.cursor(s.side(t, n) + e.from, s.forward(!t, n) ? 1 : -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(e, t, i = !0) {
    return ug(this, e, t, i);
  }
  /**
  Move a cursor position vertically. When `distance` isn't given,
  it defaults to moving to the next line (including wrapped
  lines). Otherwise, `distance` should provide a positive distance
  in pixels.
  
  When `start` has a
  [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
  motion will use that as a target horizontal position. Otherwise,
  the cursor's own horizontal position is used. The returned
  cursor will have its goal column set to whichever column was
  used.
  */
  moveVertically(e, t, i) {
    return ys(this, e, Og(this, e, t, i));
  }
  /**
  Find the DOM parent node and offset (child offset if `node` is
  an element, character offset when it is a text node) at the
  given document position.
  
  Note that for positions that aren't currently in
  `visibleRanges`, the resulting DOM position isn't necessarily
  meaningful (it may just point before or after a placeholder
  element).
  */
  domAtPos(e) {
    return this.docView.domAtPos(e);
  }
  /**
  Find the document position at the given DOM node. Can be useful
  for associating positions with DOM events. Will raise an error
  when `node` isn't part of the editor content.
  */
  posAtDOM(e, t = 0) {
    return this.docView.posFromDOM(e, t);
  }
  posAtCoords(e, t = !0) {
    return this.readMeasured(), jf(this, e, t);
  }
  /**
  Get the screen coordinates at the given document position.
  `side` determines whether the coordinates are based on the
  element before (-1) or after (1) the position (if no element is
  available on the given side, the method will transparently use
  another strategy to get reasonable coordinates).
  */
  coordsAtPos(e, t = 1) {
    this.readMeasured();
    let i = this.docView.coordsAt(e, t);
    if (!i || i.left == i.right)
      return i;
    let n = this.state.doc.lineAt(e), s = this.bidiSpans(n), o = s[At.find(s, e - n.from, -1, t)];
    return hl(i, o.dir == J.LTR == t > 0);
  }
  /**
  Return the rectangle around a given character. If `pos` does not
  point in front of a character that is in the viewport and
  rendered (i.e. not replaced, not a line break), this will return
  null. For space characters that are a line wrap point, this will
  return the position before the line break.
  */
  coordsForChar(e) {
    return this.readMeasured(), this.docView.coordsForChar(e);
  }
  /**
  The default width of a character in the editor. May not
  accurately reflect the width of all characters (given variable
  width fonts or styling of invididual ranges).
  */
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  /**
  The default height of a line in the editor. May not be accurate
  for all lines.
  */
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  /**
  The text direction
  ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
  CSS property) of the editor's content element.
  */
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  /**
  Find the text direction of the block at the given position, as
  assigned by CSS. If
  [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
  isn't enabled, or the given position is outside of the viewport,
  this will always return the same as
  [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
  this may trigger a DOM layout.
  */
  textDirectionAt(e) {
    return !this.state.facet(Df) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
  }
  /**
  Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
  (as determined by the
  [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
  CSS property of its content element).
  */
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  /**
  Returns the bidirectional text structure of the given line
  (which should be in the current document) as an array of span
  objects. The order of these spans matches the [text
  direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
  left-to-right, the leftmost spans come first, otherwise the
  rightmost spans come first.
  */
  bidiSpans(e) {
    if (e.length > t0)
      return Tf(e.length);
    let t = this.textDirectionAt(e.from), i;
    for (let s of this.bidiCache)
      if (s.from == e.from && s.dir == t && (s.fresh || Zf(s.isolates, i = qa(this, e))))
        return s.order;
    i || (i = qa(this, e));
    let n = Fm(e.text, t, i);
    return this.bidiCache.push(new Yn(e.from, e.to, t, i, !0, n)), n;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var e;
    return (this.dom.ownerDocument.hasFocus() || Z.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      df(this.contentDOM), this.docView.updateSelection();
    });
  }
  /**
  Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
  necessary when moving the editor's existing DOM to a new window or shadow root.
  */
  setRoot(e) {
    this._root != e && (this._root = e, this.observer.setWindow((e.nodeType == 9 ? e : e.ownerDocument).defaultView || window), this.mountStyles());
  }
  /**
  Clean up this editor view, removing its element from the
  document, unregistering event handlers, and notifying
  plugins. The view instance can no longer be used after
  calling this.
  */
  destroy() {
    this.root.activeElement == this.contentDOM && this.contentDOM.blur();
    for (let e of this.plugins)
      e.destroy(this);
    this.plugins = [], this.inputState.destroy(), this.docView.destroy(), this.dom.remove(), this.observer.destroy(), this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.destroyed = !0;
  }
  /**
  Returns an effect that can be
  [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
  cause it to scroll the given position or range into view.
  */
  static scrollIntoView(e, t = {}) {
    return Ur.of(new pi(typeof e == "number" ? y.cursor(e) : e, t.y, t.x, t.yMargin, t.xMargin));
  }
  /**
  Return an effect that resets the editor to its current (at the
  time this method was called) scroll position. Note that this
  only affects the editor's own scrollable element, not parents.
  See also
  [`EditorViewConfig.scrollTo`](https://codemirror.net/6/docs/ref/#view.EditorViewConfig.scrollTo).
  
  The effect should be used with a document identical to the one
  it was created for. Failing to do so is not an error, but may
  not scroll to the expected position. You can
  [map](https://codemirror.net/6/docs/ref/#state.StateEffect.map) the effect to account for changes.
  */
  scrollSnapshot() {
    let { scrollTop: e, scrollLeft: t } = this.scrollDOM, i = this.viewState.scrollAnchorAt(e);
    return Ur.of(new pi(y.cursor(i.from), "start", "start", i.top - e, t, !0));
  }
  /**
  Enable or disable tab-focus mode, which disables key bindings
  for Tab and Shift-Tab, letting the browser's default
  focus-changing behavior go through instead. This is useful to
  prevent trapping keyboard users in your editor.
  
  Without argument, this toggles the mode. With a boolean, it
  enables (true) or disables it (false). Given a number, it
  temporarily enables the mode until that number of milliseconds
  have passed or another non-Tab key is pressed.
  */
  setTabFocusMode(e) {
    e == null ? this.inputState.tabFocusMode = this.inputState.tabFocusMode < 0 ? 0 : -1 : typeof e == "boolean" ? this.inputState.tabFocusMode = e ? 0 : -1 : this.inputState.tabFocusMode != 0 && (this.inputState.tabFocusMode = Date.now() + e);
  }
  /**
  Returns an extension that can be used to add DOM event handlers.
  The value should be an object mapping event names to handler
  functions. For any given event, such functions are ordered by
  extension precedence, and the first handler to return true will
  be assumed to have handled that event, and no other handlers or
  built-in behavior will be activated for it. These are registered
  on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
  for `scroll` handlers, which will be called any time the
  editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
  its parent nodes is scrolled.
  */
  static domEventHandlers(e) {
    return se.define(() => ({}), { eventHandlers: e });
  }
  /**
  Create an extension that registers DOM event observers. Contrary
  to event [handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers),
  observers can't be prevented from running by a higher-precedence
  handler returning true. They also don't prevent other handlers
  and observers from running when they return true, and should not
  call `preventDefault`.
  */
  static domEventObservers(e) {
    return se.define(() => ({}), { eventObservers: e });
  }
  /**
  Create a theme extension. The first argument can be a
  [`style-mod`](https://github.com/marijnh/style-mod#documentation)
  style spec providing the styles for the theme. These will be
  prefixed with a generated class for the style.
  
  Because the selectors will be prefixed with a scope class, rule
  that directly match the editor's [wrapper
  element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
  added—need to be explicitly differentiated by adding an `&` to
  the selector for that element—for example
  `&.cm-focused`.
  
  When `dark` is set to true, the theme will be marked as dark,
  which will cause the `&dark` rules from [base
  themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
  `&light` when a light theme is active).
  */
  static theme(e, t) {
    let i = Wt.newName(), n = [Kr.of(i), _i.of(Co(`.${i}`, e))];
    return t && t.dark && n.push($o.of(!0)), n;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return xt.lowest(_i.of(Co("." + vo, e, lu)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let i = e.querySelector(".cm-content"), n = i && j.get(i) || j.get(e);
    return ((t = n == null ? void 0 : n.rootView) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
C.styleModule = _i;
C.inputHandler = Wf;
C.scrollHandler = Vf;
C.focusChangeEffect = Yf;
C.perLineTextDirection = Df;
C.exceptionSink = Ef;
C.updateListener = ko;
C.editable = vt;
C.mouseSelectionStyle = Mf;
C.dragMovesSelection = Xf;
C.clickAddsSelectionRange = Rf;
C.decorations = fr;
C.outerDecorations = Lf;
C.atomicRanges = dl;
C.bidiIsolatedRanges = Nf;
C.scrollMargins = _f;
C.darkTheme = $o;
C.cspNonce = /* @__PURE__ */ T.define({ combine: (r) => r.length ? r[0] : "" });
C.contentAttributes = ul;
C.editorAttributes = zf;
C.lineWrapping = /* @__PURE__ */ C.contentAttributes.of({ class: "cm-lineWrapping" });
C.announce = /* @__PURE__ */ M.define();
const t0 = 4096, ch = {};
class Yn {
  constructor(e, t, i, n, s, o) {
    this.from = e, this.to = t, this.dir = i, this.isolates = n, this.fresh = s, this.order = o;
  }
  static update(e, t) {
    if (t.empty && !e.some((s) => s.fresh))
      return e;
    let i = [], n = e.length ? e[e.length - 1].dir : J.LTR;
    for (let s = Math.max(0, e.length - 10); s < e.length; s++) {
      let o = e[s];
      o.dir == n && !t.touchesRange(o.from, o.to) && i.push(new Yn(t.mapPos(o.from, 1), t.mapPos(o.to, -1), o.dir, o.isolates, !1, o.order));
    }
    return i;
  }
}
function fh(r, e, t) {
  for (let i = r.state.facet(e), n = i.length - 1; n >= 0; n--) {
    let s = i[n], o = typeof s == "function" ? s(r) : s;
    o && mo(o, t);
  }
  return t;
}
const i0 = Z.mac ? "mac" : Z.windows ? "win" : Z.linux ? "linux" : "key";
function r0(r, e) {
  const t = r.split(/-(?!$)/);
  let i = t[t.length - 1];
  i == "Space" && (i = " ");
  let n, s, o, l;
  for (let a = 0; a < t.length - 1; ++a) {
    const h = t[a];
    if (/^(cmd|meta|m)$/i.test(h))
      l = !0;
    else if (/^a(lt)?$/i.test(h))
      n = !0;
    else if (/^(c|ctrl|control)$/i.test(h))
      s = !0;
    else if (/^s(hift)?$/i.test(h))
      o = !0;
    else if (/^mod$/i.test(h))
      e == "mac" ? l = !0 : s = !0;
    else
      throw new Error("Unrecognized modifier name: " + h);
  }
  return n && (i = "Alt-" + i), s && (i = "Ctrl-" + i), l && (i = "Meta-" + i), o && (i = "Shift-" + i), i;
}
function Jr(r, e, t) {
  return e.altKey && (r = "Alt-" + r), e.ctrlKey && (r = "Ctrl-" + r), e.metaKey && (r = "Meta-" + r), t !== !1 && e.shiftKey && (r = "Shift-" + r), r;
}
const n0 = /* @__PURE__ */ xt.default(/* @__PURE__ */ C.domEventHandlers({
  keydown(r, e) {
    return hu(au(e.state), r, e, "editor");
  }
})), Tr = /* @__PURE__ */ T.define({ enables: n0 }), uh = /* @__PURE__ */ new WeakMap();
function au(r) {
  let e = r.facet(Tr), t = uh.get(e);
  return t || uh.set(e, t = l0(e.reduce((i, n) => i.concat(n), []))), t;
}
function s0(r, e, t) {
  return hu(au(r.state), e, r, t);
}
let Ct = null;
const o0 = 4e3;
function l0(r, e = i0) {
  let t = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), n = (o, l) => {
    let a = i[o];
    if (a == null)
      i[o] = l;
    else if (a != l)
      throw new Error("Key binding " + o + " is used both as a regular binding and as a multi-stroke prefix");
  }, s = (o, l, a, h, c) => {
    var f, d;
    let O = t[o] || (t[o] = /* @__PURE__ */ Object.create(null)), p = l.split(/ (?!$)/).map((b) => r0(b, e));
    for (let b = 1; b < p.length; b++) {
      let S = p.slice(0, b).join(" ");
      n(S, !0), O[S] || (O[S] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(k) => {
          let Q = Ct = { view: k, prefix: S, scope: o };
          return setTimeout(() => {
            Ct == Q && (Ct = null);
          }, o0), !0;
        }]
      });
    }
    let m = p.join(" ");
    n(m, !1);
    let g = O[m] || (O[m] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((d = (f = O._any) === null || f === void 0 ? void 0 : f.run) === null || d === void 0 ? void 0 : d.slice()) || []
    });
    a && g.run.push(a), h && (g.preventDefault = !0), c && (g.stopPropagation = !0);
  };
  for (let o of r) {
    let l = o.scope ? o.scope.split(" ") : ["editor"];
    if (o.any)
      for (let h of l) {
        let c = t[h] || (t[h] = /* @__PURE__ */ Object.create(null));
        c._any || (c._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: f } = o;
        for (let d in c)
          c[d].run.push((O) => f(O, Zo));
      }
    let a = o[e] || o.key;
    if (a)
      for (let h of l)
        s(h, a, o.run, o.preventDefault, o.stopPropagation), o.shift && s(h, "Shift-" + a, o.shift, o.preventDefault, o.stopPropagation);
  }
  return t;
}
let Zo = null;
function hu(r, e, t, i) {
  Zo = e;
  let n = Am(e), s = fe(n, 0), o = Ve(s) == n.length && n != " ", l = "", a = !1, h = !1, c = !1;
  Ct && Ct.view == t && Ct.scope == i && (l = Ct.prefix + " ", Hf.indexOf(e.keyCode) < 0 && (h = !0, Ct = null));
  let f = /* @__PURE__ */ new Set(), d = (g) => {
    if (g) {
      for (let b of g.run)
        if (!f.has(b) && (f.add(b), b(t)))
          return g.stopPropagation && (c = !0), !0;
      g.preventDefault && (g.stopPropagation && (c = !0), h = !0);
    }
    return !1;
  }, O = r[i], p, m;
  return O && (d(O[l + Jr(n, e, !o)]) ? a = !0 : o && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(Z.windows && e.ctrlKey && e.altKey) && (p = Yt[e.keyCode]) && p != n ? (d(O[l + Jr(p, e, !0)]) || e.shiftKey && (m = ar[e.keyCode]) != n && m != p && d(O[l + Jr(m, e, !1)])) && (a = !0) : o && e.shiftKey && d(O[l + Jr(n, e, !0)]) && (a = !0), !a && d(O._any) && (a = !0)), h && (a = !0), a && c && e.stopPropagation(), Zo = null, a;
}
class Ar {
  /**
  Create a marker with the given class and dimensions. If `width`
  is null, the DOM element will get no width style.
  */
  constructor(e, t, i, n, s) {
    this.className = e, this.left = t, this.top = i, this.width = n, this.height = s;
  }
  draw() {
    let e = document.createElement("div");
    return e.className = this.className, this.adjust(e), e;
  }
  update(e, t) {
    return t.className != this.className ? !1 : (this.adjust(e), !0);
  }
  adjust(e) {
    e.style.left = this.left + "px", e.style.top = this.top + "px", this.width != null && (e.style.width = this.width + "px"), e.style.height = this.height + "px";
  }
  eq(e) {
    return this.left == e.left && this.top == e.top && this.width == e.width && this.height == e.height && this.className == e.className;
  }
  /**
  Create a set of rectangles for the given selection range,
  assigning them theclass`className`. Will create a single
  rectangle for empty ranges, and a set of selection-style
  rectangles covering the range's content (in a bidi-aware
  way) for non-empty ones.
  */
  static forRange(e, t, i) {
    if (i.empty) {
      let n = e.coordsAtPos(i.head, i.assoc || 1);
      if (!n)
        return [];
      let s = cu(e);
      return [new Ar(t, n.left - s.left, n.top - s.top, null, n.bottom - n.top)];
    } else
      return a0(e, t, i);
  }
}
function cu(r) {
  let e = r.scrollDOM.getBoundingClientRect();
  return { left: (r.textDirection == J.LTR ? e.left : e.right - r.scrollDOM.clientWidth * r.scaleX) - r.scrollDOM.scrollLeft * r.scaleX, top: e.top - r.scrollDOM.scrollTop * r.scaleY };
}
function dh(r, e, t, i) {
  let n = r.coordsAtPos(e, t * 2);
  if (!n)
    return i;
  let s = r.dom.getBoundingClientRect(), o = (n.top + n.bottom) / 2, l = r.posAtCoords({ x: s.left + 1, y: o }), a = r.posAtCoords({ x: s.right - 1, y: o });
  return l == null || a == null ? i : { from: Math.max(i.from, Math.min(l, a)), to: Math.min(i.to, Math.max(l, a)) };
}
function a0(r, e, t) {
  if (t.to <= r.viewport.from || t.from >= r.viewport.to)
    return [];
  let i = Math.max(t.from, r.viewport.from), n = Math.min(t.to, r.viewport.to), s = r.textDirection == J.LTR, o = r.contentDOM, l = o.getBoundingClientRect(), a = cu(r), h = o.querySelector(".cm-line"), c = h && window.getComputedStyle(h), f = l.left + (c ? parseInt(c.paddingLeft) + Math.min(0, parseInt(c.textIndent)) : 0), d = l.right - (c ? parseInt(c.paddingRight) : 0), O = wo(r, i), p = wo(r, n), m = O.type == xe.Text ? O : null, g = p.type == xe.Text ? p : null;
  if (m && (r.lineWrapping || O.widgetLineBreaks) && (m = dh(r, i, 1, m)), g && (r.lineWrapping || p.widgetLineBreaks) && (g = dh(r, n, -1, g)), m && g && m.from == g.from && m.to == g.to)
    return S(k(t.from, t.to, m));
  {
    let x = m ? k(t.from, null, m) : Q(O, !1), v = g ? k(null, t.to, g) : Q(p, !0), $ = [];
    return (m || O).to < (g || p).from - (m && g ? 1 : 0) || O.widgetLineBreaks > 1 && x.bottom + r.defaultLineHeight / 2 < v.top ? $.push(b(f, x.bottom, d, v.top)) : x.bottom < v.top && r.elementAtHeight((x.bottom + v.top) / 2).type == xe.Text && (x.bottom = v.top = (x.bottom + v.top) / 2), S(x).concat($).concat(S(v));
  }
  function b(x, v, $, E) {
    return new Ar(
      e,
      x - a.left,
      v - a.top - 0.01,
      $ - x,
      E - v + 0.01
      /* C.Epsilon */
    );
  }
  function S({ top: x, bottom: v, horizontal: $ }) {
    let E = [];
    for (let D = 0; D < $.length; D += 2)
      E.push(b($[D], x, $[D + 1], v));
    return E;
  }
  function k(x, v, $) {
    let E = 1e9, D = -1e9, q = [];
    function Y(N, te, Qe, we, Te) {
      let Ye = r.coordsAtPos(N, N == $.to ? -2 : 2), oe = r.coordsAtPos(Qe, Qe == $.from ? 2 : -2);
      !Ye || !oe || (E = Math.min(Ye.top, oe.top, E), D = Math.max(Ye.bottom, oe.bottom, D), Te == J.LTR ? q.push(s && te ? f : Ye.left, s && we ? d : oe.right) : q.push(!s && we ? f : oe.left, !s && te ? d : Ye.right));
    }
    let W = x ?? $.from, U = v ?? $.to;
    for (let N of r.visibleRanges)
      if (N.to > W && N.from < U)
        for (let te = Math.max(N.from, W), Qe = Math.min(N.to, U); ; ) {
          let we = r.state.doc.lineAt(te);
          for (let Te of r.bidiSpans(we)) {
            let Ye = Te.from + we.from, oe = Te.to + we.from;
            if (Ye >= Qe)
              break;
            oe > te && Y(Math.max(Ye, te), x == null && Ye <= W, Math.min(oe, Qe), v == null && oe >= U, Te.dir);
          }
          if (te = we.to + 1, te >= Qe)
            break;
        }
    return q.length == 0 && Y(W, x == null, U, v == null, r.textDirection), { top: E, bottom: D, horizontal: q };
  }
  function Q(x, v) {
    let $ = l.top + (v ? x.top : x.bottom);
    return { top: $, bottom: $, horizontal: [] };
  }
}
function h0(r, e) {
  return r.constructor == e.constructor && r.eq(e);
}
class c0 {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(Sn) != e.state.facet(Sn) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, i = e.facet(Sn);
    for (; t < i.length && i[t] != this.layer; )
      t++;
    this.dom.style.zIndex = String((this.layer.above ? 150 : -1) - t);
  }
  measure() {
    return this.layer.markers(this.view);
  }
  scale() {
    let { scaleX: e, scaleY: t } = this.view;
    (e != this.scaleX || t != this.scaleY) && (this.scaleX = e, this.scaleY = t, this.dom.style.transform = `scale(${1 / e}, ${1 / t})`);
  }
  draw(e) {
    if (e.length != this.drawn.length || e.some((t, i) => !h0(t, this.drawn[i]))) {
      let t = this.dom.firstChild, i = 0;
      for (let n of e)
        n.update && t && n.constructor && this.drawn[i].constructor && n.update(t, this.drawn[i]) ? (t = t.nextSibling, i++) : this.dom.insertBefore(n.draw(), t);
      for (; t; ) {
        let n = t.nextSibling;
        t.remove(), t = n;
      }
      this.drawn = e;
    }
  }
  destroy() {
    this.layer.destroy && this.layer.destroy(this.dom, this.view), this.dom.remove();
  }
}
const Sn = /* @__PURE__ */ T.define();
function fu(r) {
  return [
    se.define((e) => new c0(e, r)),
    Sn.of(r)
  ];
}
const uu = !Z.ios, ur = /* @__PURE__ */ T.define({
  combine(r) {
    return ut(r, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function f0(r = {}) {
  return [
    ur.of(r),
    u0,
    d0,
    O0,
    qf.of(!0)
  ];
}
function du(r) {
  return r.startState.facet(ur) != r.state.facet(ur);
}
const u0 = /* @__PURE__ */ fu({
  above: !0,
  markers(r) {
    let { state: e } = r, t = e.facet(ur), i = [];
    for (let n of e.selection.ranges) {
      let s = n == e.selection.main;
      if (n.empty ? !s || uu : t.drawRangeCursor) {
        let o = s ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = n.empty ? n : y.cursor(n.head, n.head > n.anchor ? -1 : 1);
        for (let a of Ar.forRange(r, o, l))
          i.push(a);
      }
    }
    return i;
  },
  update(r, e) {
    r.transactions.some((i) => i.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = du(r);
    return t && Oh(r.state, e), r.docChanged || r.selectionSet || t;
  },
  mount(r, e) {
    Oh(e.state, r);
  },
  class: "cm-cursorLayer"
});
function Oh(r, e) {
  e.style.animationDuration = r.facet(ur).cursorBlinkRate + "ms";
}
const d0 = /* @__PURE__ */ fu({
  above: !1,
  markers(r) {
    return r.state.selection.ranges.map((e) => e.empty ? [] : Ar.forRange(r, "cm-selectionBackground", e)).reduce((e, t) => e.concat(t));
  },
  update(r, e) {
    return r.docChanged || r.selectionSet || r.viewportChanged || du(r);
  },
  class: "cm-selectionLayer"
}), To = {
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: "transparent !important" }
  },
  ".cm-content": {
    "& :focus": {
      caretColor: "initial !important",
      "&::selection, & ::selection": {
        backgroundColor: "Highlight !important"
      }
    }
  }
};
uu && (To[".cm-line"].caretColor = To[".cm-content"].caretColor = "transparent !important");
const O0 = /* @__PURE__ */ xt.highest(/* @__PURE__ */ C.theme(To)), Ou = /* @__PURE__ */ M.define({
  map(r, e) {
    return r == null ? null : e.mapPos(r);
  }
}), ji = /* @__PURE__ */ he.define({
  create() {
    return null;
  },
  update(r, e) {
    return r != null && (r = e.changes.mapPos(r)), e.effects.reduce((t, i) => i.is(Ou) ? i.value : t, r);
  }
}), p0 = /* @__PURE__ */ se.fromClass(class {
  constructor(r) {
    this.view = r, this.cursor = null, this.measureReq = { read: this.readPos.bind(this), write: this.drawCursor.bind(this) };
  }
  update(r) {
    var e;
    let t = r.state.field(ji);
    t == null ? this.cursor != null && ((e = this.cursor) === null || e === void 0 || e.remove(), this.cursor = null) : (this.cursor || (this.cursor = this.view.scrollDOM.appendChild(document.createElement("div")), this.cursor.className = "cm-dropCursor"), (r.startState.field(ji) != t || r.docChanged || r.geometryChanged) && this.view.requestMeasure(this.measureReq));
  }
  readPos() {
    let { view: r } = this, e = r.state.field(ji), t = e != null && r.coordsAtPos(e);
    if (!t)
      return null;
    let i = r.scrollDOM.getBoundingClientRect();
    return {
      left: t.left - i.left + r.scrollDOM.scrollLeft * r.scaleX,
      top: t.top - i.top + r.scrollDOM.scrollTop * r.scaleY,
      height: t.bottom - t.top
    };
  }
  drawCursor(r) {
    if (this.cursor) {
      let { scaleX: e, scaleY: t } = this.view;
      r ? (this.cursor.style.left = r.left / e + "px", this.cursor.style.top = r.top / t + "px", this.cursor.style.height = r.height / t + "px") : this.cursor.style.left = "-100000px";
    }
  }
  destroy() {
    this.cursor && this.cursor.remove();
  }
  setDropPos(r) {
    this.view.state.field(ji) != r && this.view.dispatch({ effects: Ou.of(r) });
  }
}, {
  eventObservers: {
    dragover(r) {
      this.setDropPos(this.view.posAtCoords({ x: r.clientX, y: r.clientY }));
    },
    dragleave(r) {
      (r.target == this.view.contentDOM || !this.view.contentDOM.contains(r.relatedTarget)) && this.setDropPos(null);
    },
    dragend() {
      this.setDropPos(null);
    },
    drop() {
      this.setDropPos(null);
    }
  }
});
function m0() {
  return [ji, p0];
}
function ph(r, e, t, i, n) {
  e.lastIndex = 0;
  for (let s = r.iterRange(t, i), o = t, l; !s.next().done; o += s.value.length)
    if (!s.lineBreak)
      for (; l = e.exec(s.value); )
        n(o + l.index, l);
}
function g0(r, e) {
  let t = r.visibleRanges;
  if (t.length == 1 && t[0].from == r.viewport.from && t[0].to == r.viewport.to)
    return t;
  let i = [];
  for (let { from: n, to: s } of t)
    n = Math.max(r.state.doc.lineAt(n).from, n - e), s = Math.min(r.state.doc.lineAt(s).to, s + e), i.length && i[i.length - 1].to >= n ? i[i.length - 1].to = s : i.push({ from: n, to: s });
  return i;
}
class b0 {
  /**
  Create a decorator.
  */
  constructor(e) {
    const { regexp: t, decoration: i, decorate: n, boundary: s, maxLength: o = 1e3 } = e;
    if (!t.global)
      throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
    if (this.regexp = t, n)
      this.addMatch = (l, a, h, c) => n(c, h, h + l[0].length, l, a);
    else if (typeof i == "function")
      this.addMatch = (l, a, h, c) => {
        let f = i(l, a, h);
        f && c(h, h + l[0].length, f);
      };
    else if (i)
      this.addMatch = (l, a, h, c) => c(h, h + l[0].length, i);
    else
      throw new RangeError("Either 'decorate' or 'decoration' should be provided to MatchDecorator");
    this.boundary = s, this.maxLength = o;
  }
  /**
  Compute the full set of decorations for matches in the given
  view's viewport. You'll want to call this when initializing your
  plugin.
  */
  createDeco(e) {
    let t = new Et(), i = t.add.bind(t);
    for (let { from: n, to: s } of g0(e, this.maxLength))
      ph(e.state.doc, this.regexp, n, s, (o, l) => this.addMatch(l, e, o, i));
    return t.finish();
  }
  /**
  Update a set of decorations for a view update. `deco` _must_ be
  the set of decorations produced by _this_ `MatchDecorator` for
  the view state before the update.
  */
  updateDeco(e, t) {
    let i = 1e9, n = -1;
    return e.docChanged && e.changes.iterChanges((s, o, l, a) => {
      a > e.view.viewport.from && l < e.view.viewport.to && (i = Math.min(l, i), n = Math.max(a, n));
    }), e.viewportChanged || n - i > 1e3 ? this.createDeco(e.view) : n > -1 ? this.updateRange(e.view, t.map(e.changes), i, n) : t;
  }
  updateRange(e, t, i, n) {
    for (let s of e.visibleRanges) {
      let o = Math.max(s.from, i), l = Math.min(s.to, n);
      if (l > o) {
        let a = e.state.doc.lineAt(o), h = a.to < l ? e.state.doc.lineAt(l) : a, c = Math.max(s.from, a.from), f = Math.min(s.to, h.to);
        if (this.boundary) {
          for (; o > a.from; o--)
            if (this.boundary.test(a.text[o - 1 - a.from])) {
              c = o;
              break;
            }
          for (; l < h.to; l++)
            if (this.boundary.test(h.text[l - h.from])) {
              f = l;
              break;
            }
        }
        let d = [], O, p = (m, g, b) => d.push(b.range(m, g));
        if (a == h)
          for (this.regexp.lastIndex = c - a.from; (O = this.regexp.exec(a.text)) && O.index < f - a.from; )
            this.addMatch(O, e, O.index + a.from, p);
        else
          ph(e.state.doc, this.regexp, c, f, (m, g) => this.addMatch(g, e, m, p));
        t = t.update({ filterFrom: c, filterTo: f, filter: (m, g) => m < c || g > f, add: d });
      }
    }
    return t;
  }
}
const Ao = /x/.unicode != null ? "gu" : "g", S0 = /* @__PURE__ */ new RegExp(`[\0-\b
--­؜​‎‏\u2028\u2029‭‮⁦⁧⁩\uFEFF￹-￼]`, Ao), y0 = {
  0: "null",
  7: "bell",
  8: "backspace",
  10: "newline",
  11: "vertical tab",
  13: "carriage return",
  27: "escape",
  8203: "zero width space",
  8204: "zero width non-joiner",
  8205: "zero width joiner",
  8206: "left-to-right mark",
  8207: "right-to-left mark",
  8232: "line separator",
  8237: "left-to-right override",
  8238: "right-to-left override",
  8294: "left-to-right isolate",
  8295: "right-to-left isolate",
  8297: "pop directional isolate",
  8233: "paragraph separator",
  65279: "zero width no-break space",
  65532: "object replacement"
};
let Qs = null;
function x0() {
  var r;
  if (Qs == null && typeof document < "u" && document.body) {
    let e = document.body.style;
    Qs = ((r = e.tabSize) !== null && r !== void 0 ? r : e.MozTabSize) != null;
  }
  return Qs || !1;
}
const yn = /* @__PURE__ */ T.define({
  combine(r) {
    let e = ut(r, {
      render: null,
      specialChars: S0,
      addSpecialChars: null
    });
    return (e.replaceTabs = !x0()) && (e.specialChars = new RegExp("	|" + e.specialChars.source, Ao)), e.addSpecialChars && (e.specialChars = new RegExp(e.specialChars.source + "|" + e.addSpecialChars.source, Ao)), e;
  }
});
function k0(r = {}) {
  return [yn.of(r), Q0()];
}
let mh = null;
function Q0() {
  return mh || (mh = se.fromClass(class {
    constructor(r) {
      this.view = r, this.decorations = R.none, this.decorationCache = /* @__PURE__ */ Object.create(null), this.decorator = this.makeDecorator(r.state.facet(yn)), this.decorations = this.decorator.createDeco(r);
    }
    makeDecorator(r) {
      return new b0({
        regexp: r.specialChars,
        decoration: (e, t, i) => {
          let { doc: n } = t.state, s = fe(e[0], 0);
          if (s == 9) {
            let o = n.lineAt(i), l = t.state.tabSize, a = Ge(o.text, l, i - o.from);
            return R.replace({
              widget: new v0((l - a % l) * this.view.defaultCharacterWidth / this.view.scaleX)
            });
          }
          return this.decorationCache[s] || (this.decorationCache[s] = R.replace({ widget: new $0(r, s) }));
        },
        boundary: r.replaceTabs ? void 0 : /[^]/
      });
    }
    update(r) {
      let e = r.state.facet(yn);
      r.startState.facet(yn) != e ? (this.decorator = this.makeDecorator(e), this.decorations = this.decorator.createDeco(r.view)) : this.decorations = this.decorator.updateDeco(r, this.decorations);
    }
  }, {
    decorations: (r) => r.decorations
  }));
}
const w0 = "•";
function P0(r) {
  return r >= 32 ? w0 : r == 10 ? "␤" : String.fromCharCode(9216 + r);
}
class $0 extends Qt {
  constructor(e, t) {
    super(), this.options = e, this.code = t;
  }
  eq(e) {
    return e.code == this.code;
  }
  toDOM(e) {
    let t = P0(this.code), i = e.state.phrase("Control character") + " " + (y0[this.code] || "0x" + this.code.toString(16)), n = this.options.render && this.options.render(this.code, i, t);
    if (n)
      return n;
    let s = document.createElement("span");
    return s.textContent = t, s.title = i, s.setAttribute("aria-label", i), s.className = "cm-specialChar", s;
  }
  ignoreEvent() {
    return !1;
  }
}
class v0 extends Qt {
  constructor(e) {
    super(), this.width = e;
  }
  eq(e) {
    return e.width == this.width;
  }
  toDOM() {
    let e = document.createElement("span");
    return e.textContent = "	", e.className = "cm-tab", e.style.width = this.width + "px", e;
  }
  ignoreEvent() {
    return !1;
  }
}
function C0() {
  return T0;
}
const Z0 = /* @__PURE__ */ R.line({ class: "cm-activeLine" }), T0 = /* @__PURE__ */ se.fromClass(class {
  constructor(r) {
    this.decorations = this.getDeco(r);
  }
  update(r) {
    (r.docChanged || r.selectionSet) && (this.decorations = this.getDeco(r.view));
  }
  getDeco(r) {
    let e = -1, t = [];
    for (let i of r.state.selection.ranges) {
      let n = r.lineBlockAt(i.head);
      n.from > e && (t.push(Z0.range(n.from)), e = n.from);
    }
    return R.set(t);
  }
}, {
  decorations: (r) => r.decorations
}), Ro = 2e3;
function A0(r, e, t) {
  let i = Math.min(e.line, t.line), n = Math.max(e.line, t.line), s = [];
  if (e.off > Ro || t.off > Ro || e.col < 0 || t.col < 0) {
    let o = Math.min(e.off, t.off), l = Math.max(e.off, t.off);
    for (let a = i; a <= n; a++) {
      let h = r.doc.line(a);
      h.length <= l && s.push(y.range(h.from + o, h.to + l));
    }
  } else {
    let o = Math.min(e.col, t.col), l = Math.max(e.col, t.col);
    for (let a = i; a <= n; a++) {
      let h = r.doc.line(a), c = ao(h.text, o, r.tabSize, !0);
      if (c < 0)
        s.push(y.cursor(h.to));
      else {
        let f = ao(h.text, l, r.tabSize);
        s.push(y.range(h.from + c, h.from + f));
      }
    }
  }
  return s;
}
function R0(r, e) {
  let t = r.coordsAtPos(r.viewport.from);
  return t ? Math.round(Math.abs((t.left - e) / r.defaultCharacterWidth)) : -1;
}
function gh(r, e) {
  let t = r.posAtCoords({ x: e.clientX, y: e.clientY }, !1), i = r.state.doc.lineAt(t), n = t - i.from, s = n > Ro ? -1 : n == i.length ? R0(r, e.clientX) : Ge(i.text, r.state.tabSize, t - i.from);
  return { line: i.number, col: s, off: n };
}
function X0(r, e) {
  let t = gh(r, e), i = r.state.selection;
  return t ? {
    update(n) {
      if (n.docChanged) {
        let s = n.changes.mapPos(n.startState.doc.line(t.line).from), o = n.state.doc.lineAt(s);
        t = { line: o.number, col: t.col, off: Math.min(t.off, o.length) }, i = i.map(n.changes);
      }
    },
    get(n, s, o) {
      let l = gh(r, n);
      if (!l)
        return i;
      let a = A0(r.state, t, l);
      return a.length ? o ? y.create(a.concat(i.ranges)) : y.create(a) : i;
    }
  } : null;
}
function M0(r) {
  let e = (t) => t.altKey && t.button == 0;
  return C.mouseSelectionStyle.of((t, i) => e(i) ? X0(t, i) : null);
}
const E0 = {
  Alt: [18, (r) => !!r.altKey],
  Control: [17, (r) => !!r.ctrlKey],
  Shift: [16, (r) => !!r.shiftKey],
  Meta: [91, (r) => !!r.metaKey]
}, W0 = { style: "cursor: crosshair" };
function Y0(r = {}) {
  let [e, t] = E0[r.key || "Alt"], i = se.fromClass(class {
    constructor(n) {
      this.view = n, this.isDown = !1;
    }
    set(n) {
      this.isDown != n && (this.isDown = n, this.view.update([]));
    }
  }, {
    eventObservers: {
      keydown(n) {
        this.set(n.keyCode == e || t(n));
      },
      keyup(n) {
        (n.keyCode == e || !t(n)) && this.set(!1);
      },
      mousemove(n) {
        this.set(t(n));
      }
    }
  });
  return [
    i,
    C.contentAttributes.of((n) => {
      var s;
      return !((s = n.plugin(i)) === null || s === void 0) && s.isDown ? W0 : null;
    })
  ];
}
const Yi = "-10000px";
class pu {
  constructor(e, t, i, n) {
    this.facet = t, this.createTooltipView = i, this.removeTooltipView = n, this.input = e.state.facet(t), this.tooltips = this.input.filter((o) => o);
    let s = null;
    this.tooltipViews = this.tooltips.map((o) => s = i(o, s));
  }
  update(e, t) {
    var i;
    let n = e.state.facet(this.facet), s = n.filter((a) => a);
    if (n === this.input) {
      for (let a of this.tooltipViews)
        a.update && a.update(e);
      return !1;
    }
    let o = [], l = t ? [] : null;
    for (let a = 0; a < s.length; a++) {
      let h = s[a], c = -1;
      if (h) {
        for (let f = 0; f < this.tooltips.length; f++) {
          let d = this.tooltips[f];
          d && d.create == h.create && (c = f);
        }
        if (c < 0)
          o[a] = this.createTooltipView(h, a ? o[a - 1] : null), l && (l[a] = !!h.above);
        else {
          let f = o[a] = this.tooltipViews[c];
          l && (l[a] = t[c]), f.update && f.update(e);
        }
      }
    }
    for (let a of this.tooltipViews)
      o.indexOf(a) < 0 && (this.removeTooltipView(a), (i = a.destroy) === null || i === void 0 || i.call(a));
    return t && (l.forEach((a, h) => t[h] = a), t.length = l.length), this.input = n, this.tooltips = s, this.tooltipViews = o, !0;
  }
}
function D0(r) {
  let { win: e } = r;
  return { top: 0, left: 0, bottom: e.innerHeight, right: e.innerWidth };
}
const ws = /* @__PURE__ */ T.define({
  combine: (r) => {
    var e, t, i;
    return {
      position: Z.ios ? "absolute" : ((e = r.find((n) => n.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = r.find((n) => n.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((i = r.find((n) => n.tooltipSpace)) === null || i === void 0 ? void 0 : i.tooltipSpace) || D0
    };
  }
}), bh = /* @__PURE__ */ new WeakMap(), gl = /* @__PURE__ */ se.fromClass(class {
  constructor(r) {
    this.view = r, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let e = r.state.facet(ws);
    this.position = e.position, this.parent = e.parent, this.classes = r.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new pu(r, bl, (t, i) => this.createTooltip(t, i), (t) => {
      this.resizeObserver && this.resizeObserver.unobserve(t.dom), t.dom.remove();
    }), this.above = this.manager.tooltips.map((t) => !!t.above), this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((t) => {
      Date.now() > this.lastTransaction - 50 && t.length > 0 && t[t.length - 1].intersectionRatio < 1 && this.measureSoon();
    }, { threshold: [1] }) : null, this.observeIntersection(), r.win.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this)), this.maybeMeasure();
  }
  createContainer() {
    this.parent ? (this.container = document.createElement("div"), this.container.style.position = "relative", this.container.className = this.view.themeClasses, this.parent.appendChild(this.container)) : this.container = this.view.dom;
  }
  observeIntersection() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      for (let r of this.manager.tooltipViews)
        this.intersectionObserver.observe(r.dom);
    }
  }
  measureSoon() {
    this.measureTimeout < 0 && (this.measureTimeout = setTimeout(() => {
      this.measureTimeout = -1, this.maybeMeasure();
    }, 50));
  }
  update(r) {
    r.transactions.length && (this.lastTransaction = Date.now());
    let e = this.manager.update(r, this.above);
    e && this.observeIntersection();
    let t = e || r.geometryChanged, i = r.state.facet(ws);
    if (i.position != this.position && !this.madeAbsolute) {
      this.position = i.position;
      for (let n of this.manager.tooltipViews)
        n.dom.style.position = this.position;
      t = !0;
    }
    if (i.parent != this.parent) {
      this.parent && this.container.remove(), this.parent = i.parent, this.createContainer();
      for (let n of this.manager.tooltipViews)
        this.container.appendChild(n.dom);
      t = !0;
    } else this.parent && this.view.themeClasses != this.classes && (this.classes = this.container.className = this.view.themeClasses);
    t && this.maybeMeasure();
  }
  createTooltip(r, e) {
    let t = r.create(this.view), i = e ? e.dom : null;
    if (t.dom.classList.add("cm-tooltip"), r.arrow && !t.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
      let n = document.createElement("div");
      n.className = "cm-tooltip-arrow", t.dom.appendChild(n);
    }
    return t.dom.style.position = this.position, t.dom.style.top = Yi, t.dom.style.left = "0px", this.container.insertBefore(t.dom, i), t.mount && t.mount(this.view), this.resizeObserver && this.resizeObserver.observe(t.dom), t;
  }
  destroy() {
    var r, e, t;
    this.view.win.removeEventListener("resize", this.measureSoon);
    for (let i of this.manager.tooltipViews)
      i.dom.remove(), (r = i.destroy) === null || r === void 0 || r.call(i);
    this.parent && this.container.remove(), (e = this.resizeObserver) === null || e === void 0 || e.disconnect(), (t = this.intersectionObserver) === null || t === void 0 || t.disconnect(), clearTimeout(this.measureTimeout);
  }
  readMeasure() {
    let r = this.view.dom.getBoundingClientRect(), e = 1, t = 1, i = !1;
    if (this.position == "fixed" && this.manager.tooltipViews.length) {
      let { dom: n } = this.manager.tooltipViews[0];
      if (Z.gecko)
        i = n.offsetParent != this.container.ownerDocument.body;
      else if (n.style.top == Yi && n.style.left == "0px") {
        let s = n.getBoundingClientRect();
        i = Math.abs(s.top + 1e4) > 1 || Math.abs(s.left) > 1;
      }
    }
    if (i || this.position == "absolute")
      if (this.parent) {
        let n = this.parent.getBoundingClientRect();
        n.width && n.height && (e = n.width / this.parent.offsetWidth, t = n.height / this.parent.offsetHeight);
      } else
        ({ scaleX: e, scaleY: t } = this.view.viewState);
    return {
      editor: r,
      parent: this.parent ? this.container.getBoundingClientRect() : r,
      pos: this.manager.tooltips.map((n, s) => {
        let o = this.manager.tooltipViews[s];
        return o.getCoords ? o.getCoords(n.pos) : this.view.coordsAtPos(n.pos);
      }),
      size: this.manager.tooltipViews.map(({ dom: n }) => n.getBoundingClientRect()),
      space: this.view.state.facet(ws).tooltipSpace(this.view),
      scaleX: e,
      scaleY: t,
      makeAbsolute: i
    };
  }
  writeMeasure(r) {
    var e;
    if (r.makeAbsolute) {
      this.madeAbsolute = !0, this.position = "absolute";
      for (let l of this.manager.tooltipViews)
        l.dom.style.position = "absolute";
    }
    let { editor: t, space: i, scaleX: n, scaleY: s } = r, o = [];
    for (let l = 0; l < this.manager.tooltips.length; l++) {
      let a = this.manager.tooltips[l], h = this.manager.tooltipViews[l], { dom: c } = h, f = r.pos[l], d = r.size[l];
      if (!f || f.bottom <= Math.max(t.top, i.top) || f.top >= Math.min(t.bottom, i.bottom) || f.right < Math.max(t.left, i.left) - 0.1 || f.left > Math.min(t.right, i.right) + 0.1) {
        c.style.top = Yi;
        continue;
      }
      let O = a.arrow ? h.dom.querySelector(".cm-tooltip-arrow") : null, p = O ? 7 : 0, m = d.right - d.left, g = (e = bh.get(h)) !== null && e !== void 0 ? e : d.bottom - d.top, b = h.offset || V0, S = this.view.textDirection == J.LTR, k = d.width > i.right - i.left ? S ? i.left : i.right - d.width : S ? Math.max(i.left, Math.min(f.left - (O ? 14 : 0) + b.x, i.right - m)) : Math.min(Math.max(i.left, f.left - m + (O ? 14 : 0) - b.x), i.right - m), Q = this.above[l];
      !a.strictSide && (Q ? f.top - (d.bottom - d.top) - b.y < i.top : f.bottom + (d.bottom - d.top) + b.y > i.bottom) && Q == i.bottom - f.bottom > f.top - i.top && (Q = this.above[l] = !Q);
      let x = (Q ? f.top - i.top : i.bottom - f.bottom) - p;
      if (x < g && h.resize !== !1) {
        if (x < this.view.defaultLineHeight) {
          c.style.top = Yi;
          continue;
        }
        bh.set(h, g), c.style.height = (g = x) / s + "px";
      } else c.style.height && (c.style.height = "");
      let v = Q ? f.top - g - p - b.y : f.bottom + p + b.y, $ = k + m;
      if (h.overlap !== !0)
        for (let E of o)
          E.left < $ && E.right > k && E.top < v + g && E.bottom > v && (v = Q ? E.top - g - 2 - p : E.bottom + p + 2);
      if (this.position == "absolute" ? (c.style.top = (v - r.parent.top) / s + "px", c.style.left = (k - r.parent.left) / n + "px") : (c.style.top = v / s + "px", c.style.left = k / n + "px"), O) {
        let E = f.left + (S ? b.x : -b.x) - (k + 14 - 7);
        O.style.left = E / n + "px";
      }
      h.overlap !== !0 && o.push({ left: k, top: v, right: $, bottom: v + g }), c.classList.toggle("cm-tooltip-above", Q), c.classList.toggle("cm-tooltip-below", !Q), h.positioned && h.positioned(r.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let r of this.manager.tooltipViews)
        r.dom.style.top = Yi;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
}), q0 = /* @__PURE__ */ C.baseTheme({
  ".cm-tooltip": {
    zIndex: 100,
    boxSizing: "border-box"
  },
  "&light .cm-tooltip": {
    border: "1px solid #bbb",
    backgroundColor: "#f5f5f5"
  },
  "&light .cm-tooltip-section:not(:first-child)": {
    borderTop: "1px solid #bbb"
  },
  "&dark .cm-tooltip": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tooltip-arrow": {
    height: "7px",
    width: `${7 * 2}px`,
    position: "absolute",
    zIndex: -1,
    overflow: "hidden",
    "&:before, &:after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      borderLeft: "7px solid transparent",
      borderRight: "7px solid transparent"
    },
    ".cm-tooltip-above &": {
      bottom: "-7px",
      "&:before": {
        borderTop: "7px solid #bbb"
      },
      "&:after": {
        borderTop: "7px solid #f5f5f5",
        bottom: "1px"
      }
    },
    ".cm-tooltip-below &": {
      top: "-7px",
      "&:before": {
        borderBottom: "7px solid #bbb"
      },
      "&:after": {
        borderBottom: "7px solid #f5f5f5",
        top: "1px"
      }
    }
  },
  "&dark .cm-tooltip .cm-tooltip-arrow": {
    "&:before": {
      borderTopColor: "#333338",
      borderBottomColor: "#333338"
    },
    "&:after": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    }
  }
}), V0 = { x: 0, y: 0 }, bl = /* @__PURE__ */ T.define({
  enables: [gl, q0]
}), Dn = /* @__PURE__ */ T.define({
  combine: (r) => r.reduce((e, t) => e.concat(t), [])
});
class ts {
  // Needs to be static so that host tooltip instances always match
  static create(e) {
    return new ts(e);
  }
  constructor(e) {
    this.view = e, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new pu(e, Dn, (t, i) => this.createHostedView(t, i), (t) => t.dom.remove());
  }
  createHostedView(e, t) {
    let i = e.create(this.view);
    return i.dom.classList.add("cm-tooltip-section"), this.dom.insertBefore(i.dom, t ? t.dom.nextSibling : this.dom.firstChild), this.mounted && i.mount && i.mount(this.view), i;
  }
  mount(e) {
    for (let t of this.manager.tooltipViews)
      t.mount && t.mount(e);
    this.mounted = !0;
  }
  positioned(e) {
    for (let t of this.manager.tooltipViews)
      t.positioned && t.positioned(e);
  }
  update(e) {
    this.manager.update(e);
  }
  destroy() {
    var e;
    for (let t of this.manager.tooltipViews)
      (e = t.destroy) === null || e === void 0 || e.call(t);
  }
  passProp(e) {
    let t;
    for (let i of this.manager.tooltipViews) {
      let n = i[e];
      if (n !== void 0) {
        if (t === void 0)
          t = n;
        else if (t !== n)
          return;
      }
    }
    return t;
  }
  get offset() {
    return this.passProp("offset");
  }
  get getCoords() {
    return this.passProp("getCoords");
  }
  get overlap() {
    return this.passProp("overlap");
  }
  get resize() {
    return this.passProp("resize");
  }
}
const B0 = /* @__PURE__ */ bl.compute([Dn], (r) => {
  let e = r.facet(Dn);
  return e.length === 0 ? null : {
    pos: Math.min(...e.map((t) => t.pos)),
    end: Math.max(...e.map((t) => {
      var i;
      return (i = t.end) !== null && i !== void 0 ? i : t.pos;
    })),
    create: ts.create,
    above: e[0].above,
    arrow: e.some((t) => t.arrow)
  };
});
class z0 {
  constructor(e, t, i, n, s) {
    this.view = e, this.source = t, this.field = i, this.setHover = n, this.hoverTime = s, this.hoverTimeout = -1, this.restartTimeout = -1, this.pending = null, this.lastMove = { x: 0, y: 0, target: e.dom, time: 0 }, this.checkHover = this.checkHover.bind(this), e.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this)), e.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
  }
  update() {
    this.pending && (this.pending = null, clearTimeout(this.restartTimeout), this.restartTimeout = setTimeout(() => this.startHover(), 20));
  }
  get active() {
    return this.view.state.field(this.field);
  }
  checkHover() {
    if (this.hoverTimeout = -1, this.active.length)
      return;
    let e = Date.now() - this.lastMove.time;
    e < this.hoverTime ? this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime - e) : this.startHover();
  }
  startHover() {
    clearTimeout(this.restartTimeout);
    let { view: e, lastMove: t } = this, i = e.docView.nearest(t.target);
    if (!i)
      return;
    let n, s = 1;
    if (i instanceof Tt)
      n = i.posAtStart;
    else {
      if (n = e.posAtCoords(t), n == null)
        return;
      let l = e.coordsAtPos(n);
      if (!l || t.y < l.top || t.y > l.bottom || t.x < l.left - e.defaultCharacterWidth || t.x > l.right + e.defaultCharacterWidth)
        return;
      let a = e.bidiSpans(e.state.doc.lineAt(n)).find((c) => c.from <= n && c.to >= n), h = a && a.dir == J.RTL ? -1 : 1;
      s = t.x < l.left ? -h : h;
    }
    let o = this.source(e, n, s);
    if (o != null && o.then) {
      let l = this.pending = { pos: n };
      o.then((a) => {
        this.pending == l && (this.pending = null, a && !(Array.isArray(a) && !a.length) && e.dispatch({ effects: this.setHover.of(Array.isArray(a) ? a : [a]) }));
      }, (a) => Ce(e.state, a, "hover tooltip"));
    } else o && !(Array.isArray(o) && !o.length) && e.dispatch({ effects: this.setHover.of(Array.isArray(o) ? o : [o]) });
  }
  get tooltip() {
    let e = this.view.plugin(gl), t = e ? e.manager.tooltips.findIndex((i) => i.create == ts.create) : -1;
    return t > -1 ? e.manager.tooltipViews[t] : null;
  }
  mousemove(e) {
    var t, i;
    this.lastMove = { x: e.clientX, y: e.clientY, target: e.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let { active: n, tooltip: s } = this;
    if (n.length && s && !L0(s.dom, e) || this.pending) {
      let { pos: o } = n[0] || this.pending, l = (i = (t = n[0]) === null || t === void 0 ? void 0 : t.end) !== null && i !== void 0 ? i : o;
      (o == l ? this.view.posAtCoords(this.lastMove) != o : !N0(this.view, o, l, e.clientX, e.clientY)) && (this.view.dispatch({ effects: this.setHover.of([]) }), this.pending = null);
    }
  }
  mouseleave(e) {
    clearTimeout(this.hoverTimeout), this.hoverTimeout = -1;
    let { active: t } = this;
    if (t.length) {
      let { tooltip: i } = this;
      i && i.dom.contains(e.relatedTarget) ? this.watchTooltipLeave(i.dom) : this.view.dispatch({ effects: this.setHover.of([]) });
    }
  }
  watchTooltipLeave(e) {
    let t = (i) => {
      e.removeEventListener("mouseleave", t), this.active.length && !this.view.dom.contains(i.relatedTarget) && this.view.dispatch({ effects: this.setHover.of([]) });
    };
    e.addEventListener("mouseleave", t);
  }
  destroy() {
    clearTimeout(this.hoverTimeout), this.view.dom.removeEventListener("mouseleave", this.mouseleave), this.view.dom.removeEventListener("mousemove", this.mousemove);
  }
}
const en = 4;
function L0(r, e) {
  let t = r.getBoundingClientRect();
  return e.clientX >= t.left - en && e.clientX <= t.right + en && e.clientY >= t.top - en && e.clientY <= t.bottom + en;
}
function N0(r, e, t, i, n, s) {
  let o = r.scrollDOM.getBoundingClientRect(), l = r.documentTop + r.documentPadding.top + r.contentHeight;
  if (o.left > i || o.right < i || o.top > n || Math.min(o.bottom, l) < n)
    return !1;
  let a = r.posAtCoords({ x: i, y: n }, !1);
  return a >= e && a <= t;
}
function _0(r, e = {}) {
  let t = M.define(), i = he.define({
    create() {
      return [];
    },
    update(n, s) {
      if (n.length && (e.hideOnChange && (s.docChanged || s.selection) ? n = [] : e.hideOn && (n = n.filter((o) => !e.hideOn(s, o))), s.docChanged)) {
        let o = [];
        for (let l of n) {
          let a = s.changes.mapPos(l.pos, -1, de.TrackDel);
          if (a != null) {
            let h = Object.assign(/* @__PURE__ */ Object.create(null), l);
            h.pos = a, h.end != null && (h.end = s.changes.mapPos(h.end)), o.push(h);
          }
        }
        n = o;
      }
      for (let o of s.effects)
        o.is(t) && (n = o.value), o.is(U0) && (n = []);
      return n;
    },
    provide: (n) => Dn.from(n)
  });
  return {
    active: i,
    extension: [
      i,
      se.define((n) => new z0(
        n,
        r,
        i,
        t,
        e.hoverTime || 300
        /* Hover.Time */
      )),
      B0
    ]
  };
}
function mu(r, e) {
  let t = r.plugin(gl);
  if (!t)
    return null;
  let i = t.manager.tooltips.indexOf(e);
  return i < 0 ? null : t.manager.tooltipViews[i];
}
const U0 = /* @__PURE__ */ M.define(), Sh = /* @__PURE__ */ T.define({
  combine(r) {
    let e, t;
    for (let i of r)
      e = e || i.topContainer, t = t || i.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
});
function dr(r, e) {
  let t = r.plugin(gu), i = t ? t.specs.indexOf(e) : -1;
  return i > -1 ? t.panels[i] : null;
}
const gu = /* @__PURE__ */ se.fromClass(class {
  constructor(r) {
    this.input = r.state.facet(Or), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(r));
    let e = r.state.facet(Sh);
    this.top = new tn(r, !0, e.topContainer), this.bottom = new tn(r, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(r) {
    let e = r.state.facet(Sh);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new tn(r.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new tn(r.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = r.state.facet(Or);
    if (t != this.input) {
      let i = t.filter((a) => a), n = [], s = [], o = [], l = [];
      for (let a of i) {
        let h = this.specs.indexOf(a), c;
        h < 0 ? (c = a(r.view), l.push(c)) : (c = this.panels[h], c.update && c.update(r)), n.push(c), (c.top ? s : o).push(c);
      }
      this.specs = i, this.panels = n, this.top.sync(s), this.bottom.sync(o);
      for (let a of l)
        a.dom.classList.add("cm-panel"), a.mount && a.mount();
    } else
      for (let i of this.panels)
        i.update && i.update(r);
  }
  destroy() {
    this.top.sync([]), this.bottom.sync([]);
  }
}, {
  provide: (r) => C.scrollMargins.of((e) => {
    let t = e.plugin(r);
    return t && { top: t.top.scrollMargin(), bottom: t.bottom.scrollMargin() };
  })
});
class tn {
  constructor(e, t, i) {
    this.view = e, this.top = t, this.container = i, this.dom = void 0, this.classes = "", this.panels = [], this.syncClasses();
  }
  sync(e) {
    for (let t of this.panels)
      t.destroy && e.indexOf(t) < 0 && t.destroy();
    this.panels = e, this.syncDOM();
  }
  syncDOM() {
    if (this.panels.length == 0) {
      this.dom && (this.dom.remove(), this.dom = void 0);
      return;
    }
    if (!this.dom) {
      this.dom = document.createElement("div"), this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom", this.dom.style[this.top ? "top" : "bottom"] = "0";
      let t = this.container || this.view.dom;
      t.insertBefore(this.dom, this.top ? t.firstChild : null);
    }
    let e = this.dom.firstChild;
    for (let t of this.panels)
      if (t.dom.parentNode == this.dom) {
        for (; e != t.dom; )
          e = yh(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = yh(e);
  }
  scrollMargin() {
    return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
  }
  syncClasses() {
    if (!(!this.container || this.classes == this.view.themeClasses)) {
      for (let e of this.classes.split(" "))
        e && this.container.classList.remove(e);
      for (let e of (this.classes = this.view.themeClasses).split(" "))
        e && this.container.classList.add(e);
    }
  }
}
function yh(r) {
  let e = r.nextSibling;
  return r.remove(), e;
}
const Or = /* @__PURE__ */ T.define({
  enables: gu
});
class St extends Ft {
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  Compare this marker to another marker of the same type.
  */
  eq(e) {
    return !1;
  }
  /**
  Called if the marker has a `toDOM` method and its representation
  was removed from a gutter.
  */
  destroy(e) {
  }
}
St.prototype.elementClass = "";
St.prototype.toDOM = void 0;
St.prototype.mapMode = de.TrackBefore;
St.prototype.startSide = St.prototype.endSide = -1;
St.prototype.point = !0;
const xn = /* @__PURE__ */ T.define(), I0 = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => z.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {}
}, Ji = /* @__PURE__ */ T.define();
function j0(r) {
  return [bu(), Ji.of(Object.assign(Object.assign({}, I0), r))];
}
const xh = /* @__PURE__ */ T.define({
  combine: (r) => r.some((e) => e)
});
function bu(r) {
  return [
    G0
  ];
}
const G0 = /* @__PURE__ */ se.fromClass(class {
  constructor(r) {
    this.view = r, this.prevViewport = r.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = r.state.facet(Ji).map((e) => new Qh(r, e));
    for (let e of this.gutters)
      this.dom.appendChild(e.dom);
    this.fixed = !r.state.facet(xh), this.fixed && (this.dom.style.position = "sticky"), this.syncGutters(!1), r.scrollDOM.insertBefore(this.dom, r.contentDOM);
  }
  update(r) {
    if (this.updateGutters(r)) {
      let e = this.prevViewport, t = r.view.viewport, i = Math.min(e.to, t.to) - Math.max(e.from, t.from);
      this.syncGutters(i < (t.to - t.from) * 0.8);
    }
    r.geometryChanged && (this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px"), this.view.state.facet(xh) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : ""), this.prevViewport = r.view.viewport;
  }
  syncGutters(r) {
    let e = this.dom.nextSibling;
    r && this.dom.remove();
    let t = z.iter(this.view.state.facet(xn), this.view.viewport.from), i = [], n = this.gutters.map((s) => new F0(s, this.view.viewport, -this.view.documentPadding.top));
    for (let s of this.view.viewportLineBlocks)
      if (i.length && (i = []), Array.isArray(s.type)) {
        let o = !0;
        for (let l of s.type)
          if (l.type == xe.Text && o) {
            Xo(t, i, l.from);
            for (let a of n)
              a.line(this.view, l, i);
            o = !1;
          } else if (l.widget)
            for (let a of n)
              a.widget(this.view, l);
      } else if (s.type == xe.Text) {
        Xo(t, i, s.from);
        for (let o of n)
          o.line(this.view, s, i);
      } else if (s.widget)
        for (let o of n)
          o.widget(this.view, s);
    for (let s of n)
      s.finish();
    r && this.view.scrollDOM.insertBefore(this.dom, e);
  }
  updateGutters(r) {
    let e = r.startState.facet(Ji), t = r.state.facet(Ji), i = r.docChanged || r.heightChanged || r.viewportChanged || !z.eq(r.startState.facet(xn), r.state.facet(xn), r.view.viewport.from, r.view.viewport.to);
    if (e == t)
      for (let n of this.gutters)
        n.update(r) && (i = !0);
    else {
      i = !0;
      let n = [];
      for (let s of t) {
        let o = e.indexOf(s);
        o < 0 ? n.push(new Qh(this.view, s)) : (this.gutters[o].update(r), n.push(this.gutters[o]));
      }
      for (let s of this.gutters)
        s.dom.remove(), n.indexOf(s) < 0 && s.destroy();
      for (let s of n)
        this.dom.appendChild(s.dom);
      this.gutters = n;
    }
    return i;
  }
  destroy() {
    for (let r of this.gutters)
      r.destroy();
    this.dom.remove();
  }
}, {
  provide: (r) => C.scrollMargins.of((e) => {
    let t = e.plugin(r);
    return !t || t.gutters.length == 0 || !t.fixed ? null : e.textDirection == J.LTR ? { left: t.dom.offsetWidth * e.scaleX } : { right: t.dom.offsetWidth * e.scaleX };
  })
});
function kh(r) {
  return Array.isArray(r) ? r : [r];
}
function Xo(r, e, t) {
  for (; r.value && r.from <= t; )
    r.from == t && e.push(r.value), r.next();
}
class F0 {
  constructor(e, t, i) {
    this.gutter = e, this.height = i, this.i = 0, this.cursor = z.iter(e.markers, t.from);
  }
  addElement(e, t, i) {
    let { gutter: n } = this, s = (t.top - this.height) / e.scaleY, o = t.height / e.scaleY;
    if (this.i == n.elements.length) {
      let l = new Su(e, o, s, i);
      n.elements.push(l), n.dom.appendChild(l.dom);
    } else
      n.elements[this.i].update(e, o, s, i);
    this.height = t.bottom, this.i++;
  }
  line(e, t, i) {
    let n = [];
    Xo(this.cursor, n, t.from), i.length && (n = n.concat(i));
    let s = this.gutter.config.lineMarker(e, t, n);
    s && n.unshift(s);
    let o = this.gutter;
    n.length == 0 && !o.config.renderEmptyElements || this.addElement(e, t, n);
  }
  widget(e, t) {
    let i = this.gutter.config.widgetMarker(e, t.widget, t);
    i && this.addElement(e, t, [i]);
  }
  finish() {
    let e = this.gutter;
    for (; e.elements.length > this.i; ) {
      let t = e.elements.pop();
      e.dom.removeChild(t.dom), t.destroy();
    }
  }
}
class Qh {
  constructor(e, t) {
    this.view = e, this.config = t, this.elements = [], this.spacer = null, this.dom = document.createElement("div"), this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let i in t.domEventHandlers)
      this.dom.addEventListener(i, (n) => {
        let s = n.target, o;
        if (s != this.dom && this.dom.contains(s)) {
          for (; s.parentNode != this.dom; )
            s = s.parentNode;
          let a = s.getBoundingClientRect();
          o = (a.top + a.bottom) / 2;
        } else
          o = n.clientY;
        let l = e.lineBlockAtHeight(o - e.documentTop);
        t.domEventHandlers[i](e, l, n) && n.preventDefault();
      });
    this.markers = kh(t.markers(e)), t.initialSpacer && (this.spacer = new Su(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = kh(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let n = this.config.updateSpacer(this.spacer.markers[0], e);
      n != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [n]);
    }
    let i = e.view.viewport;
    return !z.eq(this.markers, t, i.from, i.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class Su {
  constructor(e, t, i, n) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, i, n);
  }
  update(e, t, i, n) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != i && (this.dom.style.marginTop = (this.above = i) ? i + "px" : ""), H0(this.markers, n) || this.setMarkers(e, n);
  }
  setMarkers(e, t) {
    let i = "cm-gutterElement", n = this.dom.firstChild;
    for (let s = 0, o = 0; ; ) {
      let l = o, a = s < t.length ? t[s++] : null, h = !1;
      if (a) {
        let c = a.elementClass;
        c && (i += " " + c);
        for (let f = o; f < this.markers.length; f++)
          if (this.markers[f].compare(a)) {
            l = f, h = !0;
            break;
          }
      } else
        l = this.markers.length;
      for (; o < l; ) {
        let c = this.markers[o++];
        if (c.toDOM) {
          c.destroy(n);
          let f = n.nextSibling;
          n.remove(), n = f;
        }
      }
      if (!a)
        break;
      a.toDOM && (h ? n = n.nextSibling : this.dom.insertBefore(a.toDOM(e), n)), h && o++;
    }
    this.dom.className = i, this.markers = t;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function H0(r, e) {
  if (r.length != e.length)
    return !1;
  for (let t = 0; t < r.length; t++)
    if (!r[t].compare(e[t]))
      return !1;
  return !0;
}
const K0 = /* @__PURE__ */ T.define(), hi = /* @__PURE__ */ T.define({
  combine(r) {
    return ut(r, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(e, t) {
        let i = Object.assign({}, e);
        for (let n in t) {
          let s = i[n], o = t[n];
          i[n] = s ? (l, a, h) => s(l, a, h) || o(l, a, h) : o;
        }
        return i;
      }
    });
  }
});
class Ps extends St {
  constructor(e) {
    super(), this.number = e;
  }
  eq(e) {
    return this.number == e.number;
  }
  toDOM() {
    return document.createTextNode(this.number);
  }
}
function $s(r, e) {
  return r.state.facet(hi).formatNumber(e, r.state);
}
const J0 = /* @__PURE__ */ Ji.compute([hi], (r) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(K0);
  },
  lineMarker(e, t, i) {
    return i.some((n) => n.toDOM) ? null : new Ps($s(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: () => null,
  lineMarkerChange: (e) => e.startState.facet(hi) != e.state.facet(hi),
  initialSpacer(e) {
    return new Ps($s(e, wh(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let i = $s(t.view, wh(t.view.state.doc.lines));
    return i == e.number ? e : new Ps(i);
  },
  domEventHandlers: r.facet(hi).domEventHandlers
}));
function eb(r = {}) {
  return [
    hi.of(r),
    bu(),
    J0
  ];
}
function wh(r) {
  let e = 9;
  for (; e < r; )
    e = e * 10 + 9;
  return e;
}
const tb = /* @__PURE__ */ new class extends St {
  constructor() {
    super(...arguments), this.elementClass = "cm-activeLineGutter";
  }
}(), ib = /* @__PURE__ */ xn.compute(["selection"], (r) => {
  let e = [], t = -1;
  for (let i of r.selection.ranges) {
    let n = r.doc.lineAt(i.head).from;
    n > t && (t = n, e.push(tb.range(n)));
  }
  return z.of(e);
});
function rb() {
  return ib;
}
var vs;
const Ut = /* @__PURE__ */ new X();
function Sl(r) {
  return T.define({
    combine: r ? (e) => e.concat(r) : void 0
  });
}
const yl = /* @__PURE__ */ new X();
class ze {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, i = [], n = "") {
    this.data = e, this.name = n, B.prototype.hasOwnProperty("tree") || Object.defineProperty(B.prototype, "tree", { get() {
      return H(this);
    } }), this.parser = t, this.extension = [
      yt.of(this),
      B.languageData.of((s, o, l) => {
        let a = Ph(s, o, l), h = a.type.prop(Ut);
        if (!h)
          return [];
        let c = s.facet(h), f = a.type.prop(yl);
        if (f) {
          let d = a.resolve(o - a.from, l);
          for (let O of f)
            if (O.test(d, s)) {
              let p = s.facet(O.facet);
              return O.type == "replace" ? p : p.concat(c);
            }
        }
        return c;
      })
    ].concat(i);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(e, t, i = -1) {
    return Ph(e, t, i).type.prop(Ut) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(yt);
    if ((t == null ? void 0 : t.data) == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let i = [], n = (s, o) => {
      if (s.prop(Ut) == this.data) {
        i.push({ from: o, to: o + s.length });
        return;
      }
      let l = s.prop(X.mounted);
      if (l) {
        if (l.tree.prop(Ut) == this.data) {
          if (l.overlay)
            for (let a of l.overlay)
              i.push({ from: a.from + o, to: a.to + o });
          else
            i.push({ from: o, to: o + s.length });
          return;
        } else if (l.overlay) {
          let a = i.length;
          if (n(l.tree, l.overlay[0].from + o), i.length > a)
            return;
        }
      }
      for (let a = 0; a < s.children.length; a++) {
        let h = s.children[a];
        h instanceof _ && n(h, s.positions[a] + o);
      }
    };
    return n(H(e), 0), i;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
ze.setState = /* @__PURE__ */ M.define();
function Ph(r, e, t) {
  let i = r.facet(yt), n = H(r).topNode;
  if (!i || i.allowsNesting)
    for (let s = n; s; s = s.enter(e, t, F.ExcludeBuffers))
      s.type.isTop && (n = s);
  return n;
}
class ei extends ze {
  constructor(e, t, i) {
    super(e, t, [], i), this.parser = t;
  }
  /**
  Define a language from a parser.
  */
  static define(e) {
    let t = Sl(e.languageData);
    return new ei(t, e.parser.configure({
      props: [Ut.add((i) => i.isTop ? t : void 0)]
    }), e.name);
  }
  /**
  Create a new instance of this language with a reconfigured
  version of its parser and optionally a new name.
  */
  configure(e, t) {
    return new ei(this.data, this.parser.configure(e), t || this.name);
  }
  get allowsNesting() {
    return this.parser.hasWrappers();
  }
}
function H(r) {
  let e = r.field(ze.state, !1);
  return e ? e.tree : _.empty;
}
class nb {
  /**
  Create an input object for the given document.
  */
  constructor(e) {
    this.doc = e, this.cursorPos = 0, this.string = "", this.cursor = e.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(e) {
    return this.string = this.cursor.next(e - this.cursorPos).value, this.cursorPos = e + this.string.length, this.cursorPos - this.string.length;
  }
  chunk(e) {
    return this.syncTo(e), this.string;
  }
  get lineChunks() {
    return !0;
  }
  read(e, t) {
    let i = this.cursorPos - this.string.length;
    return e < i || t >= this.cursorPos ? this.doc.sliceString(e, t) : this.string.slice(e - i, t - i);
  }
}
let Di = null;
class pr {
  constructor(e, t, i = [], n, s, o, l, a) {
    this.parser = e, this.state = t, this.fragments = i, this.tree = n, this.treeLen = s, this.viewport = o, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new pr(e, t, [], _.empty, 0, i, [], null);
  }
  startParse() {
    return this.parser.startParse(new nb(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != _.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var i;
      if (typeof e == "number") {
        let n = Date.now() + e;
        e = () => Date.now() > n;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let n = this.parse.advance();
        if (n)
          if (this.fragments = this.withoutTempSkipped(pt.addTree(n, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (i = this.parse.stoppedAt) !== null && i !== void 0 ? i : this.state.doc.length, this.tree = n, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
            this.parse = this.startParse();
          else
            return !0;
        if (e())
          return !1;
      }
    });
  }
  /**
  @internal
  */
  takeTree() {
    let e, t;
    this.parse && (e = this.parse.parsedPos) >= this.treeLen && ((this.parse.stoppedAt == null || this.parse.stoppedAt > e) && this.parse.stopAt(e), this.withContext(() => {
      for (; !(t = this.parse.advance()); )
        ;
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(pt.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = Di;
    Di = this;
    try {
      return e();
    } finally {
      Di = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = $h(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: i, tree: n, treeLen: s, viewport: o, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((h, c, f, d) => a.push({ fromA: h, toA: c, fromB: f, toB: d })), i = pt.applyChanges(i, a), n = _.empty, s = 0, o = { from: e.mapPos(o.from, -1), to: e.mapPos(o.to, 1) }, this.skipped.length) {
        l = [];
        for (let h of this.skipped) {
          let c = e.mapPos(h.from, 1), f = e.mapPos(h.to, -1);
          c < f && l.push({ from: c, to: f });
        }
      }
    }
    return new pr(this.parser, t, i, n, s, o, l, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(e) {
    if (this.viewport.from == e.from && this.viewport.to == e.to)
      return !1;
    this.viewport = e;
    let t = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from: n, to: s } = this.skipped[i];
      n < e.to && s > e.from && (this.fragments = $h(this.fragments, n, s), this.skipped.splice(i--, 1));
    }
    return this.skipped.length >= t ? !1 : (this.reset(), !0);
  }
  /**
  @internal
  */
  reset() {
    this.parse && (this.takeTree(), this.parse = null);
  }
  /**
  Notify the parse scheduler that the given region was skipped
  because it wasn't in view, and the parse should be restarted
  when it comes into view.
  */
  skipUntilInView(e, t) {
    this.skipped.push({ from: e, to: t });
  }
  /**
  Returns a parser intended to be used as placeholder when
  asynchronously loading a nested parser. It'll skip its input and
  mark it as not-really-parsed, so that the next update will parse
  it again.
  
  When `until` is given, a reparse will be scheduled when that
  promise resolves.
  */
  static getSkippingParser(e) {
    return new class extends il {
      createParse(t, i, n) {
        let s = n[0].from, o = n[n.length - 1].to;
        return {
          parsedPos: s,
          advance() {
            let a = Di;
            if (a) {
              for (let h of n)
                a.tempSkipped.push(h);
              e && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, e]) : e);
            }
            return this.parsedPos = o, new _(ae.none, [], [], o - s);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
      }
    }();
  }
  /**
  @internal
  */
  isDone(e) {
    e = Math.min(e, this.state.doc.length);
    let t = this.fragments;
    return this.treeLen >= e && t.length && t[0].from == 0 && t[0].to >= e;
  }
  /**
  Get the context for the current parse, or `null` if no editor
  parse is in progress.
  */
  static get() {
    return Di;
  }
}
function $h(r, e, t) {
  return pt.applyChanges(r, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class Qi {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), i = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, i) || t.takeTree(), new Qi(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), i = pr.create(e.facet(yt).parser, e, { from: 0, to: t });
    return i.work(20, t) || i.takeTree(), new Qi(i);
  }
}
ze.state = /* @__PURE__ */ he.define({
  create: Qi.init,
  update(r, e) {
    for (let t of e.effects)
      if (t.is(ze.setState))
        return t.value;
    return e.startState.facet(yt) != e.state.facet(yt) ? Qi.init(e.state) : r.apply(e);
  }
});
let yu = (r) => {
  let e = setTimeout(
    () => r(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (yu = (r) => {
  let e = -1, t = setTimeout(
    () => {
      e = requestIdleCallback(r, {
        timeout: 400
        /* Work.MinPause */
      });
    },
    100
    /* Work.MinPause */
  );
  return () => e < 0 ? clearTimeout(t) : cancelIdleCallback(e);
});
const Cs = typeof navigator < "u" && (!((vs = navigator.scheduling) === null || vs === void 0) && vs.isInputPending) ? () => navigator.scheduling.isInputPending() : null, sb = /* @__PURE__ */ se.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(ze.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(ze.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = yu(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: i, viewport: { to: n } } = this.view, s = i.field(ze.state);
    if (s.tree == s.context.tree && s.context.isDone(
      n + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let o = Date.now() + Math.min(this.chunkBudget, 100, e && !Cs ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = s.context.treeLen < n && i.doc.length > n + 1e3, a = s.context.work(() => Cs && Cs() || Date.now() > o, n + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (s.context.takeTree(), this.view.dispatch({ effects: ze.setState.of(new Qi(s.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(s.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => Ce(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
  }
  destroy() {
    this.working && this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
}), yt = /* @__PURE__ */ T.define({
  combine(r) {
    return r.length ? r[0] : null;
  },
  enables: (r) => [
    ze.state,
    sb,
    C.contentAttributes.compute([r], (e) => {
      let t = e.facet(r);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
});
class wi {
  /**
  Create a language support object.
  */
  constructor(e, t = []) {
    this.language = e, this.support = t, this.extension = [e, t];
  }
}
class qn {
  constructor(e, t, i, n, s, o = void 0) {
    this.name = e, this.alias = t, this.extensions = i, this.filename = n, this.loadFunc = s, this.support = o, this.loading = null;
  }
  /**
  Start loading the the language. Will return a promise that
  resolves to a [`LanguageSupport`](https://codemirror.net/6/docs/ref/#language.LanguageSupport)
  object when the language successfully loads.
  */
  load() {
    return this.loading || (this.loading = this.loadFunc().then((e) => this.support = e, (e) => {
      throw this.loading = null, e;
    }));
  }
  /**
  Create a language description.
  */
  static of(e) {
    let { load: t, support: i } = e;
    if (!t) {
      if (!i)
        throw new RangeError("Must pass either 'load' or 'support' to LanguageDescription.of");
      t = () => Promise.resolve(i);
    }
    return new qn(e.name, (e.alias || []).concat(e.name).map((n) => n.toLowerCase()), e.extensions || [], e.filename, t, i);
  }
  /**
  Look for a language in the given array of descriptions that
  matches the filename. Will first match
  [`filename`](https://codemirror.net/6/docs/ref/#language.LanguageDescription.filename) patterns,
  and then [extensions](https://codemirror.net/6/docs/ref/#language.LanguageDescription.extensions),
  and return the first language that matches.
  */
  static matchFilename(e, t) {
    for (let n of e)
      if (n.filename && n.filename.test(t))
        return n;
    let i = /\.([^.]+)$/.exec(t);
    if (i) {
      for (let n of e)
        if (n.extensions.indexOf(i[1]) > -1)
          return n;
    }
    return null;
  }
  /**
  Look for a language whose name or alias matches the the given
  name (case-insensitively). If `fuzzy` is true, and no direct
  matchs is found, this'll also search for a language whose name
  or alias occurs in the string (for names shorter than three
  characters, only when surrounded by non-word characters).
  */
  static matchLanguageName(e, t, i = !0) {
    t = t.toLowerCase();
    for (let n of e)
      if (n.alias.some((s) => s == t))
        return n;
    if (i)
      for (let n of e)
        for (let s of n.alias) {
          let o = t.indexOf(s);
          if (o > -1 && (s.length > 2 || !/\w/.test(t[o - 1]) && !/\w/.test(t[o + s.length])))
            return n;
        }
    return null;
  }
}
const ob = /* @__PURE__ */ T.define(), Rr = /* @__PURE__ */ T.define({
  combine: (r) => {
    if (!r.length)
      return "  ";
    let e = r[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(r[0]));
    return e;
  }
});
function Vn(r) {
  let e = r.facet(Rr);
  return e.charCodeAt(0) == 9 ? r.tabSize * e.length : e.length;
}
function mr(r, e) {
  let t = "", i = r.tabSize, n = r.facet(Rr)[0];
  if (n == "	") {
    for (; e >= i; )
      t += "	", e -= i;
    n = " ";
  }
  for (let s = 0; s < e; s++)
    t += n;
  return t;
}
function xl(r, e) {
  r instanceof B && (r = new is(r));
  for (let i of r.state.facet(ob)) {
    let n = i(r, e);
    if (n !== void 0)
      return n;
  }
  let t = H(r.state);
  return t.length >= e ? lb(r, t, e) : null;
}
class is {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = Vn(e);
  }
  /**
  Get a description of the line at the given position, taking
  [simulated line
  breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  into account. If there is such a break at `pos`, the `bias`
  argument determines whether the part of the line line before or
  after the break is used.
  */
  lineAt(e, t = 1) {
    let i = this.state.doc.lineAt(e), { simulateBreak: n, simulateDoubleBreak: s } = this.options;
    return n != null && n >= i.from && n <= i.to ? s && n == e ? { text: "", from: e } : (t < 0 ? n < e : n <= e) ? { text: i.text.slice(n - i.from), from: n } : { text: i.text.slice(0, n - i.from), from: i.from } : i;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(e, t = 1) {
    if (this.options.simulateDoubleBreak && e == this.options.simulateBreak)
      return "";
    let { text: i, from: n } = this.lineAt(e, t);
    return i.slice(e - n, Math.min(i.length, e + 100 - n));
  }
  /**
  Find the column for the given position.
  */
  column(e, t = 1) {
    let { text: i, from: n } = this.lineAt(e, t), s = this.countColumn(i, e - n), o = this.options.overrideIndentation ? this.options.overrideIndentation(n) : -1;
    return o > -1 && (s += o - this.countColumn(i, i.search(/\S|$/))), s;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(e, t = e.length) {
    return Ge(e, this.state.tabSize, t);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(e, t = 1) {
    let { text: i, from: n } = this.lineAt(e, t), s = this.options.overrideIndentation;
    if (s) {
      let o = s(n);
      if (o > -1)
        return o;
    }
    return this.countColumn(i, i.search(/\S|$/));
  }
  /**
  Returns the [simulated line
  break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  for this context, if any.
  */
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const Ti = /* @__PURE__ */ new X();
function lb(r, e, t) {
  let i = e.resolveStack(t), n = i.node.enterUnfinishedNodesBefore(t);
  if (n != i.node) {
    let s = [];
    for (let o = n; o != i.node; o = o.parent)
      s.push(o);
    for (let o = s.length - 1; o >= 0; o--)
      i = { node: s[o], next: i };
  }
  return xu(i, r, t);
}
function xu(r, e, t) {
  for (let i = r; i; i = i.next) {
    let n = hb(i.node);
    if (n)
      return n(kl.create(e, t, i));
  }
  return 0;
}
function ab(r) {
  return r.pos == r.options.simulateBreak && r.options.simulateDoubleBreak;
}
function hb(r) {
  let e = r.type.prop(Ti);
  if (e)
    return e;
  let t = r.firstChild, i;
  if (t && (i = t.type.prop(X.closedBy))) {
    let n = r.lastChild, s = n && i.indexOf(n.name) > -1;
    return (o) => ku(o, !0, 1, void 0, s && !ab(o) ? n.from : void 0);
  }
  return r.parent == null ? cb : null;
}
function cb() {
  return 0;
}
class kl extends is {
  constructor(e, t, i) {
    super(e.state, e.options), this.base = e, this.pos = t, this.context = i;
  }
  /**
  The syntax tree node to which the indentation strategy
  applies.
  */
  get node() {
    return this.context.node;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new kl(e, t, i);
  }
  /**
  Get the text directly after `this.pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  /**
  Get the indentation at the reference line for `this.node`, which
  is the line on which it starts, unless there is a node that is
  _not_ a parent of this node covering the start of that line. If
  so, the line at the start of that node is tried, again skipping
  on if it is covered by another such node.
  */
  get baseIndent() {
    return this.baseIndentFor(this.node);
  }
  /**
  Get the indentation for the reference line of the given node
  (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
  */
  baseIndentFor(e) {
    let t = this.state.doc.lineAt(e.from);
    for (; ; ) {
      let i = e.resolve(t.from);
      for (; i.parent && i.parent.from == i.from; )
        i = i.parent;
      if (fb(i, e))
        break;
      t = this.state.doc.lineAt(i.from);
    }
    return this.lineIndent(t.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    return xu(this.context.next, this.base, this.pos);
  }
}
function fb(r, e) {
  for (let t = e; t; t = t.parent)
    if (r == t)
      return !0;
  return !1;
}
function ub(r) {
  let e = r.node, t = e.childAfter(e.from), i = e.lastChild;
  if (!t)
    return null;
  let n = r.options.simulateBreak, s = r.state.doc.lineAt(t.from), o = n == null || n <= s.from ? s.to : Math.min(s.to, n);
  for (let l = t.to; ; ) {
    let a = e.childAfter(l);
    if (!a || a == i)
      return null;
    if (!a.type.isSkipped)
      return a.from < o ? t : null;
    l = a.to;
  }
}
function db({ closing: r, align: e = !0, units: t = 1 }) {
  return (i) => ku(i, e, t, r);
}
function ku(r, e, t, i, n) {
  let s = r.textAfter, o = s.match(/^\s*/)[0].length, l = i && s.slice(o, o + i.length) == i || n == r.pos + o, a = e ? ub(r) : null;
  return a ? l ? r.column(a.from) : r.column(a.to) : r.baseIndent + (l ? 0 : r.unit * t);
}
const Ob = (r) => r.baseIndent;
function mi({ except: r, units: e = 1 } = {}) {
  return (t) => {
    let i = r && r.test(t.textAfter);
    return t.baseIndent + (i ? 0 : e * t.unit);
  };
}
const pb = 200;
function mb() {
  return B.transactionFilter.of((r) => {
    if (!r.docChanged || !r.isUserEvent("input.type") && !r.isUserEvent("input.complete"))
      return r;
    let e = r.startState.languageDataAt("indentOnInput", r.startState.selection.main.head);
    if (!e.length)
      return r;
    let t = r.newDoc, { head: i } = r.newSelection.main, n = t.lineAt(i);
    if (i > n.from + pb)
      return r;
    let s = t.sliceString(n.from, i);
    if (!e.some((h) => h.test(s)))
      return r;
    let { state: o } = r, l = -1, a = [];
    for (let { head: h } of o.selection.ranges) {
      let c = o.doc.lineAt(h);
      if (c.from == l)
        continue;
      l = c.from;
      let f = xl(o, c.from);
      if (f == null)
        continue;
      let d = /^\s*/.exec(c.text)[0], O = mr(o, f);
      d != O && a.push({ from: c.from, to: c.from + d.length, insert: O });
    }
    return a.length ? [r, { changes: a, sequential: !0 }] : r;
  });
}
const Qu = /* @__PURE__ */ T.define(), ri = /* @__PURE__ */ new X();
function Ql(r) {
  let e = r.firstChild, t = r.lastChild;
  return e && e.to < t.from ? { from: e.to, to: t.type.isError ? r.to : t.from } : null;
}
function gb(r, e, t) {
  let i = H(r);
  if (i.length < t)
    return null;
  let n = i.resolveStack(t, 1), s = null;
  for (let o = n; o; o = o.next) {
    let l = o.node;
    if (l.to <= t || l.from > t)
      continue;
    if (s && l.from < e)
      break;
    let a = l.type.prop(ri);
    if (a && (l.to < i.length - 50 || i.length == r.doc.length || !bb(l))) {
      let h = a(l, r);
      h && h.from <= t && h.from >= e && h.to > t && (s = h);
    }
  }
  return s;
}
function bb(r) {
  let e = r.lastChild;
  return e && e.to == r.to && e.type.isError;
}
function Bn(r, e, t) {
  for (let i of r.facet(Qu)) {
    let n = i(r, e, t);
    if (n)
      return n;
  }
  return gb(r, e, t);
}
function wu(r, e) {
  let t = e.mapPos(r.from, 1), i = e.mapPos(r.to, -1);
  return t >= i ? void 0 : { from: t, to: i };
}
const rs = /* @__PURE__ */ M.define({ map: wu }), Xr = /* @__PURE__ */ M.define({ map: wu });
function Pu(r) {
  let e = [];
  for (let { head: t } of r.state.selection.ranges)
    e.some((i) => i.from <= t && i.to >= t) || e.push(r.lineBlockAt(t));
  return e;
}
const ti = /* @__PURE__ */ he.define({
  create() {
    return R.none;
  },
  update(r, e) {
    r = r.map(e.changes);
    for (let t of e.effects)
      if (t.is(rs) && !Sb(r, t.value.from, t.value.to)) {
        let { preparePlaceholder: i } = e.state.facet(Cu), n = i ? R.replace({ widget: new $b(i(e.state, t.value)) }) : vh;
        r = r.update({ add: [n.range(t.value.from, t.value.to)] });
      } else t.is(Xr) && (r = r.update({
        filter: (i, n) => t.value.from != i || t.value.to != n,
        filterFrom: t.value.from,
        filterTo: t.value.to
      }));
    if (e.selection) {
      let t = !1, { head: i } = e.selection.main;
      r.between(i, i, (n, s) => {
        n < i && s > i && (t = !0);
      }), t && (r = r.update({
        filterFrom: i,
        filterTo: i,
        filter: (n, s) => s <= i || n >= i
      }));
    }
    return r;
  },
  provide: (r) => C.decorations.from(r),
  toJSON(r, e) {
    let t = [];
    return r.between(0, e.doc.length, (i, n) => {
      t.push(i, n);
    }), t;
  },
  fromJSON(r) {
    if (!Array.isArray(r) || r.length % 2)
      throw new RangeError("Invalid JSON for fold state");
    let e = [];
    for (let t = 0; t < r.length; ) {
      let i = r[t++], n = r[t++];
      if (typeof i != "number" || typeof n != "number")
        throw new RangeError("Invalid JSON for fold state");
      e.push(vh.range(i, n));
    }
    return R.set(e, !0);
  }
});
function zn(r, e, t) {
  var i;
  let n = null;
  return (i = r.field(ti, !1)) === null || i === void 0 || i.between(e, t, (s, o) => {
    (!n || n.from > s) && (n = { from: s, to: o });
  }), n;
}
function Sb(r, e, t) {
  let i = !1;
  return r.between(e, e, (n, s) => {
    n == e && s == t && (i = !0);
  }), i;
}
function $u(r, e) {
  return r.field(ti, !1) ? e : e.concat(M.appendConfig.of(Zu()));
}
const yb = (r) => {
  for (let e of Pu(r)) {
    let t = Bn(r.state, e.from, e.to);
    if (t)
      return r.dispatch({ effects: $u(r.state, [rs.of(t), vu(r, t)]) }), !0;
  }
  return !1;
}, xb = (r) => {
  if (!r.state.field(ti, !1))
    return !1;
  let e = [];
  for (let t of Pu(r)) {
    let i = zn(r.state, t.from, t.to);
    i && e.push(Xr.of(i), vu(r, i, !1));
  }
  return e.length && r.dispatch({ effects: e }), e.length > 0;
};
function vu(r, e, t = !0) {
  let i = r.state.doc.lineAt(e.from).number, n = r.state.doc.lineAt(e.to).number;
  return C.announce.of(`${r.state.phrase(t ? "Folded lines" : "Unfolded lines")} ${i} ${r.state.phrase("to")} ${n}.`);
}
const kb = (r) => {
  let { state: e } = r, t = [];
  for (let i = 0; i < e.doc.length; ) {
    let n = r.lineBlockAt(i), s = Bn(e, n.from, n.to);
    s && t.push(rs.of(s)), i = (s ? r.lineBlockAt(s.to) : n).to + 1;
  }
  return t.length && r.dispatch({ effects: $u(r.state, t) }), !!t.length;
}, Qb = (r) => {
  let e = r.state.field(ti, !1);
  if (!e || !e.size)
    return !1;
  let t = [];
  return e.between(0, r.state.doc.length, (i, n) => {
    t.push(Xr.of({ from: i, to: n }));
  }), r.dispatch({ effects: t }), !0;
}, wb = [
  { key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: yb },
  { key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: xb },
  { key: "Ctrl-Alt-[", run: kb },
  { key: "Ctrl-Alt-]", run: Qb }
], Pb = {
  placeholderDOM: null,
  preparePlaceholder: null,
  placeholderText: "…"
}, Cu = /* @__PURE__ */ T.define({
  combine(r) {
    return ut(r, Pb);
  }
});
function Zu(r) {
  return [ti, Zb];
}
function Tu(r, e) {
  let { state: t } = r, i = t.facet(Cu), n = (o) => {
    let l = r.lineBlockAt(r.posAtDOM(o.target)), a = zn(r.state, l.from, l.to);
    a && r.dispatch({ effects: Xr.of(a) }), o.preventDefault();
  };
  if (i.placeholderDOM)
    return i.placeholderDOM(r, n, e);
  let s = document.createElement("span");
  return s.textContent = i.placeholderText, s.setAttribute("aria-label", t.phrase("folded code")), s.title = t.phrase("unfold"), s.className = "cm-foldPlaceholder", s.onclick = n, s;
}
const vh = /* @__PURE__ */ R.replace({ widget: /* @__PURE__ */ new class extends Qt {
  toDOM(r) {
    return Tu(r, null);
  }
}() });
class $b extends Qt {
  constructor(e) {
    super(), this.value = e;
  }
  eq(e) {
    return this.value == e.value;
  }
  toDOM(e) {
    return Tu(e, this.value);
  }
}
const vb = {
  openText: "⌄",
  closedText: "›",
  markerDOM: null,
  domEventHandlers: {},
  foldingChanged: () => !1
};
class Zs extends St {
  constructor(e, t) {
    super(), this.config = e, this.open = t;
  }
  eq(e) {
    return this.config == e.config && this.open == e.open;
  }
  toDOM(e) {
    if (this.config.markerDOM)
      return this.config.markerDOM(this.open);
    let t = document.createElement("span");
    return t.textContent = this.open ? this.config.openText : this.config.closedText, t.title = e.state.phrase(this.open ? "Fold line" : "Unfold line"), t;
  }
}
function Cb(r = {}) {
  let e = Object.assign(Object.assign({}, vb), r), t = new Zs(e, !0), i = new Zs(e, !1), n = se.fromClass(class {
    constructor(o) {
      this.from = o.viewport.from, this.markers = this.buildMarkers(o);
    }
    update(o) {
      (o.docChanged || o.viewportChanged || o.startState.facet(yt) != o.state.facet(yt) || o.startState.field(ti, !1) != o.state.field(ti, !1) || H(o.startState) != H(o.state) || e.foldingChanged(o)) && (this.markers = this.buildMarkers(o.view));
    }
    buildMarkers(o) {
      let l = new Et();
      for (let a of o.viewportLineBlocks) {
        let h = zn(o.state, a.from, a.to) ? i : Bn(o.state, a.from, a.to) ? t : null;
        h && l.add(a.from, a.from, h);
      }
      return l.finish();
    }
  }), { domEventHandlers: s } = e;
  return [
    n,
    j0({
      class: "cm-foldGutter",
      markers(o) {
        var l;
        return ((l = o.plugin(n)) === null || l === void 0 ? void 0 : l.markers) || z.empty;
      },
      initialSpacer() {
        return new Zs(e, !1);
      },
      domEventHandlers: Object.assign(Object.assign({}, s), { click: (o, l, a) => {
        if (s.click && s.click(o, l, a))
          return !0;
        let h = zn(o.state, l.from, l.to);
        if (h)
          return o.dispatch({ effects: Xr.of(h) }), !0;
        let c = Bn(o.state, l.from, l.to);
        return c ? (o.dispatch({ effects: rs.of(c) }), !0) : !1;
      } })
    }),
    Zu()
  ];
}
const Zb = /* @__PURE__ */ C.baseTheme({
  ".cm-foldPlaceholder": {
    backgroundColor: "#eee",
    border: "1px solid #ddd",
    color: "#888",
    borderRadius: ".2em",
    margin: "0 1px",
    padding: "0 1px",
    cursor: "pointer"
  },
  ".cm-foldGutter span": {
    padding: "0 1px",
    cursor: "pointer"
  }
});
class Mr {
  constructor(e, t) {
    this.specs = e;
    let i;
    function n(l) {
      let a = Wt.newName();
      return (i || (i = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const s = typeof t.all == "string" ? t.all : t.all ? n(t.all) : void 0, o = t.scope;
    this.scope = o instanceof ze ? (l) => l.prop(Ut) == o.data : o ? (l) => l == o : void 0, this.style = Xc(e.map((l) => ({
      tag: l.tag,
      class: l.class || n(Object.assign({}, l, { tag: null }))
    })), {
      all: s
    }).style, this.module = i ? new Wt(i) : null, this.themeType = t.themeType;
  }
  /**
  Create a highlighter style that associates the given styles to
  the given tags. The specs must be objects that hold a style tag
  or array of tags in their `tag` property, and either a single
  `class` property providing a static CSS class (for highlighter
  that rely on external styling), or a
  [`style-mod`](https://github.com/marijnh/style-mod#documentation)-style
  set of CSS properties (which define the styling for those tags).
  
  The CSS rules created for a highlighter will be emitted in the
  order of the spec's properties. That means that for elements that
  have multiple tags associated with them, styles defined further
  down in the list will have a higher CSS precedence than styles
  defined earlier.
  */
  static define(e, t) {
    return new Mr(e, t || {});
  }
}
const Mo = /* @__PURE__ */ T.define(), Au = /* @__PURE__ */ T.define({
  combine(r) {
    return r.length ? [r[0]] : null;
  }
});
function Ts(r) {
  let e = r.facet(Mo);
  return e.length ? e : r.facet(Au);
}
function Ru(r, e) {
  let t = [Ab], i;
  return r instanceof Mr && (r.module && t.push(C.styleModule.of(r.module)), i = r.themeType), e != null && e.fallback ? t.push(Au.of(r)) : i ? t.push(Mo.computeN([C.darkTheme], (n) => n.facet(C.darkTheme) == (i == "dark") ? [r] : [])) : t.push(Mo.of(r)), t;
}
class Tb {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = H(e.state), this.decorations = this.buildDeco(e, Ts(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = H(e.state), i = Ts(e.state), n = i != Ts(e.startState), { viewport: s } = e.view, o = e.changes.mapPos(this.decoratedTo, 1);
    t.length < s.to && !n && t.type == this.tree.type && o >= s.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = o) : (t != this.tree || e.viewportChanged || n) && (this.tree = t, this.decorations = this.buildDeco(e.view, i), this.decoratedTo = s.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return R.none;
    let i = new Et();
    for (let { from: n, to: s } of e.visibleRanges)
      op(this.tree, t, (o, l, a) => {
        i.add(o, l, this.markCache[a] || (this.markCache[a] = R.mark({ class: a })));
      }, n, s);
    return i.finish();
  }
}
const Ab = /* @__PURE__ */ xt.high(/* @__PURE__ */ se.fromClass(Tb, {
  decorations: (r) => r.decorations
})), Rb = /* @__PURE__ */ Mr.define([
  {
    tag: u.meta,
    color: "#404740"
  },
  {
    tag: u.link,
    textDecoration: "underline"
  },
  {
    tag: u.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  },
  {
    tag: u.emphasis,
    fontStyle: "italic"
  },
  {
    tag: u.strong,
    fontWeight: "bold"
  },
  {
    tag: u.strikethrough,
    textDecoration: "line-through"
  },
  {
    tag: u.keyword,
    color: "#708"
  },
  {
    tag: [u.atom, u.bool, u.url, u.contentSeparator, u.labelName],
    color: "#219"
  },
  {
    tag: [u.literal, u.inserted],
    color: "#164"
  },
  {
    tag: [u.string, u.deleted],
    color: "#a11"
  },
  {
    tag: [u.regexp, u.escape, /* @__PURE__ */ u.special(u.string)],
    color: "#e40"
  },
  {
    tag: /* @__PURE__ */ u.definition(u.variableName),
    color: "#00f"
  },
  {
    tag: /* @__PURE__ */ u.local(u.variableName),
    color: "#30a"
  },
  {
    tag: [u.typeName, u.namespace],
    color: "#085"
  },
  {
    tag: u.className,
    color: "#167"
  },
  {
    tag: [/* @__PURE__ */ u.special(u.variableName), u.macroName],
    color: "#256"
  },
  {
    tag: /* @__PURE__ */ u.definition(u.propertyName),
    color: "#00c"
  },
  {
    tag: u.comment,
    color: "#940"
  },
  {
    tag: u.invalid,
    color: "#f00"
  }
]), Xb = /* @__PURE__ */ C.baseTheme({
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
}), Xu = 1e4, Mu = "()[]{}", Eu = /* @__PURE__ */ T.define({
  combine(r) {
    return ut(r, {
      afterCursor: !0,
      brackets: Mu,
      maxScanDistance: Xu,
      renderMatch: Wb
    });
  }
}), Mb = /* @__PURE__ */ R.mark({ class: "cm-matchingBracket" }), Eb = /* @__PURE__ */ R.mark({ class: "cm-nonmatchingBracket" });
function Wb(r) {
  let e = [], t = r.matched ? Mb : Eb;
  return e.push(t.range(r.start.from, r.start.to)), r.end && e.push(t.range(r.end.from, r.end.to)), e;
}
const Yb = /* @__PURE__ */ he.define({
  create() {
    return R.none;
  },
  update(r, e) {
    if (!e.docChanged && !e.selection)
      return r;
    let t = [], i = e.state.facet(Eu);
    for (let n of e.state.selection.ranges) {
      if (!n.empty)
        continue;
      let s = at(e.state, n.head, -1, i) || n.head > 0 && at(e.state, n.head - 1, 1, i) || i.afterCursor && (at(e.state, n.head, 1, i) || n.head < e.state.doc.length && at(e.state, n.head + 1, -1, i));
      s && (t = t.concat(i.renderMatch(s, e.state)));
    }
    return R.set(t, !0);
  },
  provide: (r) => C.decorations.from(r)
}), Db = [
  Yb,
  Xb
];
function qb(r = {}) {
  return [Eu.of(r), Db];
}
const Wu = /* @__PURE__ */ new X();
function Eo(r, e, t) {
  let i = r.prop(e < 0 ? X.openedBy : X.closedBy);
  if (i)
    return i;
  if (r.name.length == 1) {
    let n = t.indexOf(r.name);
    if (n > -1 && n % 2 == (e < 0 ? 1 : 0))
      return [t[n + e]];
  }
  return null;
}
function Wo(r) {
  let e = r.type.prop(Wu);
  return e ? e(r.node) : r;
}
function at(r, e, t, i = {}) {
  let n = i.maxScanDistance || Xu, s = i.brackets || Mu, o = H(r), l = o.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let h = Eo(a.type, t, s);
    if (h && a.from < a.to) {
      let c = Wo(a);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return Vb(r, e, t, a, c, h, s);
    }
  }
  return Bb(r, e, t, o, l.type, n, s);
}
function Vb(r, e, t, i, n, s, o) {
  let l = i.parent, a = { from: n.from, to: n.to }, h = 0, c = l == null ? void 0 : l.cursor();
  if (c && (t < 0 ? c.childBefore(i.from) : c.childAfter(i.to)))
    do
      if (t < 0 ? c.to <= i.from : c.from >= i.to) {
        if (h == 0 && s.indexOf(c.type.name) > -1 && c.from < c.to) {
          let f = Wo(c);
          return { start: a, end: f ? { from: f.from, to: f.to } : void 0, matched: !0 };
        } else if (Eo(c.type, t, o))
          h++;
        else if (Eo(c.type, -t, o)) {
          if (h == 0) {
            let f = Wo(c);
            return {
              start: a,
              end: f && f.from < f.to ? { from: f.from, to: f.to } : void 0,
              matched: !1
            };
          }
          h--;
        }
      }
    while (t < 0 ? c.prevSibling() : c.nextSibling());
  return { start: a, matched: !1 };
}
function Bb(r, e, t, i, n, s, o) {
  let l = t < 0 ? r.sliceDoc(e - 1, e) : r.sliceDoc(e, e + 1), a = o.indexOf(l);
  if (a < 0 || a % 2 == 0 != t > 0)
    return null;
  let h = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, c = r.doc.iterRange(e, t > 0 ? r.doc.length : 0), f = 0;
  for (let d = 0; !c.next().done && d <= s; ) {
    let O = c.value;
    t < 0 && (d += O.length);
    let p = e + d * t;
    for (let m = t > 0 ? 0 : O.length - 1, g = t > 0 ? O.length : -1; m != g; m += t) {
      let b = o.indexOf(O[m]);
      if (!(b < 0 || i.resolveInner(p + m, 1).type != n))
        if (b % 2 == 0 == t > 0)
          f++;
        else {
          if (f == 1)
            return { start: h, end: { from: p + m, to: p + m + 1 }, matched: b >> 1 == a >> 1 };
          f--;
        }
    }
    t > 0 && (d += O.length);
  }
  return c.done ? { start: h, matched: !1 } : null;
}
const zb = /* @__PURE__ */ Object.create(null), Ch = [ae.none], Zh = [], Th = /* @__PURE__ */ Object.create(null), Lb = /* @__PURE__ */ Object.create(null);
for (let [r, e] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  Lb[r] = /* @__PURE__ */ Nb(zb, e);
function As(r, e) {
  Zh.indexOf(r) > -1 || (Zh.push(r), console.warn(e));
}
function Nb(r, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let a = [];
    for (let h of l.split(".")) {
      let c = r[h] || u[h];
      c ? typeof c == "function" ? a.length ? a = a.map(c) : As(h, `Modifier ${h} used at start of tag`) : a.length ? As(h, `Tag ${h} used as modifier`) : a = Array.isArray(c) ? c : [c] : As(h, `Unknown highlighting tag ${h}`);
    }
    for (let h of a)
      t.push(h);
  }
  if (!t.length)
    return 0;
  let i = e.replace(/ /g, "_"), n = i + " " + t.map((l) => l.id), s = Th[n];
  if (s)
    return s.id;
  let o = Th[n] = ae.define({
    id: Ch.length,
    name: i,
    props: [ii({ [i]: t })]
  });
  return Ch.push(o), o.id;
}
J.RTL, J.LTR;
let Rs = null;
function Xs() {
  if (!Rs && typeof document == "object" && document.body) {
    let { style: r } = document.body, e = [], t = /* @__PURE__ */ new Set();
    for (let i in r)
      i != "cssText" && i != "cssFloat" && typeof r[i] == "string" && (/[A-Z]/.test(i) && (i = i.replace(/[A-Z]/g, (n) => "-" + n.toLowerCase())), t.has(i) || (e.push(i), t.add(i)));
    Rs = e.sort().map((i) => ({ type: "property", label: i }));
  }
  return Rs || [];
}
const Ah = /* @__PURE__ */ [
  "active",
  "after",
  "any-link",
  "autofill",
  "backdrop",
  "before",
  "checked",
  "cue",
  "default",
  "defined",
  "disabled",
  "empty",
  "enabled",
  "file-selector-button",
  "first",
  "first-child",
  "first-letter",
  "first-line",
  "first-of-type",
  "focus",
  "focus-visible",
  "focus-within",
  "fullscreen",
  "has",
  "host",
  "host-context",
  "hover",
  "in-range",
  "indeterminate",
  "invalid",
  "is",
  "lang",
  "last-child",
  "last-of-type",
  "left",
  "link",
  "marker",
  "modal",
  "not",
  "nth-child",
  "nth-last-child",
  "nth-last-of-type",
  "nth-of-type",
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "part",
  "placeholder",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "selection",
  "slotted",
  "target",
  "target-text",
  "valid",
  "visited",
  "where"
].map((r) => ({ type: "class", label: r })), Rh = /* @__PURE__ */ [
  "above",
  "absolute",
  "activeborder",
  "additive",
  "activecaption",
  "after-white-space",
  "ahead",
  "alias",
  "all",
  "all-scroll",
  "alphabetic",
  "alternate",
  "always",
  "antialiased",
  "appworkspace",
  "asterisks",
  "attr",
  "auto",
  "auto-flow",
  "avoid",
  "avoid-column",
  "avoid-page",
  "avoid-region",
  "axis-pan",
  "background",
  "backwards",
  "baseline",
  "below",
  "bidi-override",
  "blink",
  "block",
  "block-axis",
  "bold",
  "bolder",
  "border",
  "border-box",
  "both",
  "bottom",
  "break",
  "break-all",
  "break-word",
  "bullets",
  "button",
  "button-bevel",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "calc",
  "capitalize",
  "caps-lock-indicator",
  "caption",
  "captiontext",
  "caret",
  "cell",
  "center",
  "checkbox",
  "circle",
  "cjk-decimal",
  "clear",
  "clip",
  "close-quote",
  "col-resize",
  "collapse",
  "color",
  "color-burn",
  "color-dodge",
  "column",
  "column-reverse",
  "compact",
  "condensed",
  "contain",
  "content",
  "contents",
  "content-box",
  "context-menu",
  "continuous",
  "copy",
  "counter",
  "counters",
  "cover",
  "crop",
  "cross",
  "crosshair",
  "currentcolor",
  "cursive",
  "cyclic",
  "darken",
  "dashed",
  "decimal",
  "decimal-leading-zero",
  "default",
  "default-button",
  "dense",
  "destination-atop",
  "destination-in",
  "destination-out",
  "destination-over",
  "difference",
  "disc",
  "discard",
  "disclosure-closed",
  "disclosure-open",
  "document",
  "dot-dash",
  "dot-dot-dash",
  "dotted",
  "double",
  "down",
  "e-resize",
  "ease",
  "ease-in",
  "ease-in-out",
  "ease-out",
  "element",
  "ellipse",
  "ellipsis",
  "embed",
  "end",
  "ethiopic-abegede-gez",
  "ethiopic-halehame-aa-er",
  "ethiopic-halehame-gez",
  "ew-resize",
  "exclusion",
  "expanded",
  "extends",
  "extra-condensed",
  "extra-expanded",
  "fantasy",
  "fast",
  "fill",
  "fill-box",
  "fixed",
  "flat",
  "flex",
  "flex-end",
  "flex-start",
  "footnotes",
  "forwards",
  "from",
  "geometricPrecision",
  "graytext",
  "grid",
  "groove",
  "hand",
  "hard-light",
  "help",
  "hidden",
  "hide",
  "higher",
  "highlight",
  "highlighttext",
  "horizontal",
  "hsl",
  "hsla",
  "hue",
  "icon",
  "ignore",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infinite",
  "infobackground",
  "infotext",
  "inherit",
  "initial",
  "inline",
  "inline-axis",
  "inline-block",
  "inline-flex",
  "inline-grid",
  "inline-table",
  "inset",
  "inside",
  "intrinsic",
  "invert",
  "italic",
  "justify",
  "keep-all",
  "landscape",
  "large",
  "larger",
  "left",
  "level",
  "lighter",
  "lighten",
  "line-through",
  "linear",
  "linear-gradient",
  "lines",
  "list-item",
  "listbox",
  "listitem",
  "local",
  "logical",
  "loud",
  "lower",
  "lower-hexadecimal",
  "lower-latin",
  "lower-norwegian",
  "lowercase",
  "ltr",
  "luminosity",
  "manipulation",
  "match",
  "matrix",
  "matrix3d",
  "medium",
  "menu",
  "menutext",
  "message-box",
  "middle",
  "min-intrinsic",
  "mix",
  "monospace",
  "move",
  "multiple",
  "multiple_mask_images",
  "multiply",
  "n-resize",
  "narrower",
  "ne-resize",
  "nesw-resize",
  "no-close-quote",
  "no-drop",
  "no-open-quote",
  "no-repeat",
  "none",
  "normal",
  "not-allowed",
  "nowrap",
  "ns-resize",
  "numbers",
  "numeric",
  "nw-resize",
  "nwse-resize",
  "oblique",
  "opacity",
  "open-quote",
  "optimizeLegibility",
  "optimizeSpeed",
  "outset",
  "outside",
  "outside-shape",
  "overlay",
  "overline",
  "padding",
  "padding-box",
  "painted",
  "page",
  "paused",
  "perspective",
  "pinch-zoom",
  "plus-darker",
  "plus-lighter",
  "pointer",
  "polygon",
  "portrait",
  "pre",
  "pre-line",
  "pre-wrap",
  "preserve-3d",
  "progress",
  "push-button",
  "radial-gradient",
  "radio",
  "read-only",
  "read-write",
  "read-write-plaintext-only",
  "rectangle",
  "region",
  "relative",
  "repeat",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeat-x",
  "repeat-y",
  "reset",
  "reverse",
  "rgb",
  "rgba",
  "ridge",
  "right",
  "rotate",
  "rotate3d",
  "rotateX",
  "rotateY",
  "rotateZ",
  "round",
  "row",
  "row-resize",
  "row-reverse",
  "rtl",
  "run-in",
  "running",
  "s-resize",
  "sans-serif",
  "saturation",
  "scale",
  "scale3d",
  "scaleX",
  "scaleY",
  "scaleZ",
  "screen",
  "scroll",
  "scrollbar",
  "scroll-position",
  "se-resize",
  "self-start",
  "self-end",
  "semi-condensed",
  "semi-expanded",
  "separate",
  "serif",
  "show",
  "single",
  "skew",
  "skewX",
  "skewY",
  "skip-white-space",
  "slide",
  "slider-horizontal",
  "slider-vertical",
  "sliderthumb-horizontal",
  "sliderthumb-vertical",
  "slow",
  "small",
  "small-caps",
  "small-caption",
  "smaller",
  "soft-light",
  "solid",
  "source-atop",
  "source-in",
  "source-out",
  "source-over",
  "space",
  "space-around",
  "space-between",
  "space-evenly",
  "spell-out",
  "square",
  "start",
  "static",
  "status-bar",
  "stretch",
  "stroke",
  "stroke-box",
  "sub",
  "subpixel-antialiased",
  "svg_masks",
  "super",
  "sw-resize",
  "symbolic",
  "symbols",
  "system-ui",
  "table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row",
  "table-row-group",
  "text",
  "text-bottom",
  "text-top",
  "textarea",
  "textfield",
  "thick",
  "thin",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "to",
  "top",
  "transform",
  "translate",
  "translate3d",
  "translateX",
  "translateY",
  "translateZ",
  "transparent",
  "ultra-condensed",
  "ultra-expanded",
  "underline",
  "unidirectional-pan",
  "unset",
  "up",
  "upper-latin",
  "uppercase",
  "url",
  "var",
  "vertical",
  "vertical-text",
  "view-box",
  "visible",
  "visibleFill",
  "visiblePainted",
  "visibleStroke",
  "visual",
  "w-resize",
  "wait",
  "wave",
  "wider",
  "window",
  "windowframe",
  "windowtext",
  "words",
  "wrap",
  "wrap-reverse",
  "x-large",
  "x-small",
  "xor",
  "xx-large",
  "xx-small"
].map((r) => ({ type: "keyword", label: r })).concat(/* @__PURE__ */ [
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "grey",
  "green",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen"
].map((r) => ({ type: "constant", label: r }))), _b = /* @__PURE__ */ [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "footer",
  "form",
  "header",
  "hgroup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "meter",
  "nav",
  "ol",
  "output",
  "p",
  "pre",
  "ruby",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul"
].map((r) => ({ type: "type", label: r })), wt = /^(\w[\w-]*|-\w[\w-]*|)$/, Ub = /^-(-[\w-]*)?$/;
function Ib(r, e) {
  var t;
  if ((r.name == "(" || r.type.isError) && (r = r.parent || r), r.name != "ArgList")
    return !1;
  let i = (t = r.parent) === null || t === void 0 ? void 0 : t.firstChild;
  return (i == null ? void 0 : i.name) != "Callee" ? !1 : e.sliceString(i.from, i.to) == "var";
}
const Xh = /* @__PURE__ */ new Cc(), jb = ["Declaration"];
function Gb(r) {
  for (let e = r; ; ) {
    if (e.type.isTop)
      return e;
    if (!(e = e.parent))
      return r;
  }
}
function Yu(r, e, t) {
  if (e.to - e.from > 4096) {
    let i = Xh.get(e);
    if (i)
      return i;
    let n = [], s = /* @__PURE__ */ new Set(), o = e.cursor(F.IncludeAnonymous);
    if (o.firstChild())
      do
        for (let l of Yu(r, o.node, t))
          s.has(l.label) || (s.add(l.label), n.push(l));
      while (o.nextSibling());
    return Xh.set(e, n), n;
  } else {
    let i = [], n = /* @__PURE__ */ new Set();
    return e.cursor().iterate((s) => {
      var o;
      if (t(s) && s.matchContext(jb) && ((o = s.node.nextSibling) === null || o === void 0 ? void 0 : o.name) == ":") {
        let l = r.sliceString(s.from, s.to);
        n.has(l) || (n.add(l), i.push({ label: l, type: "variable" }));
      }
    }), i;
  }
}
const Fb = (r) => (e) => {
  let { state: t, pos: i } = e, n = H(t).resolveInner(i, -1), s = n.type.isError && n.from == n.to - 1 && t.doc.sliceString(n.from, n.to) == "-";
  if (n.name == "PropertyName" || (s || n.name == "TagName") && /^(Block|Styles)$/.test(n.resolve(n.to).name))
    return { from: n.from, options: Xs(), validFor: wt };
  if (n.name == "ValueName")
    return { from: n.from, options: Rh, validFor: wt };
  if (n.name == "PseudoClassName")
    return { from: n.from, options: Ah, validFor: wt };
  if (r(n) || (e.explicit || s) && Ib(n, t.doc))
    return {
      from: r(n) || s ? n.from : i,
      options: Yu(t.doc, Gb(n), r),
      validFor: Ub
    };
  if (n.name == "TagName") {
    for (let { parent: a } = n; a; a = a.parent)
      if (a.name == "Block")
        return { from: n.from, options: Xs(), validFor: wt };
    return { from: n.from, options: _b, validFor: wt };
  }
  if (!e.explicit)
    return null;
  let o = n.resolve(i), l = o.childBefore(i);
  return l && l.name == ":" && o.name == "PseudoClassSelector" ? { from: i, options: Ah, validFor: wt } : l && l.name == ":" && o.name == "Declaration" || o.name == "ArgList" ? { from: i, options: Rh, validFor: wt } : o.name == "Block" || o.name == "Styles" ? { from: i, options: Xs(), validFor: wt } : null;
}, Hb = /* @__PURE__ */ Fb((r) => r.name == "VariableName"), Ln = /* @__PURE__ */ ei.define({
  name: "css",
  parser: /* @__PURE__ */ fm.configure({
    props: [
      /* @__PURE__ */ Ti.add({
        Declaration: /* @__PURE__ */ mi()
      }),
      /* @__PURE__ */ ri.add({
        "Block KeyframeList": Ql
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*\}$/,
    wordChars: "-"
  }
});
function Kb() {
  return new wi(Ln, Ln.data.of({ autocomplete: Hb }));
}
const Jb = 312, Mh = 1, e1 = 2, t1 = 3, i1 = 4, r1 = 313, n1 = 315, s1 = 316, o1 = 5, l1 = 6, a1 = 0, Yo = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
], Du = 125, h1 = 59, Do = 47, c1 = 42, f1 = 43, u1 = 45, d1 = 60, O1 = 44, p1 = 63, m1 = 46, g1 = new Ac({
  start: !1,
  shift(r, e) {
    return e == o1 || e == l1 || e == n1 ? r : e == s1;
  },
  strict: !1
}), b1 = new Ke((r, e) => {
  let { next: t } = r;
  (t == Du || t == -1 || e.context) && r.acceptToken(r1);
}, { contextual: !0, fallback: !0 }), S1 = new Ke((r, e) => {
  let { next: t } = r, i;
  Yo.indexOf(t) > -1 || t == Do && ((i = r.peek(1)) == Do || i == c1) || t != Du && t != h1 && t != -1 && !e.context && r.acceptToken(Jb);
}, { contextual: !0 }), y1 = new Ke((r, e) => {
  let { next: t } = r;
  if (t == f1 || t == u1) {
    if (r.advance(), t == r.next) {
      r.advance();
      let i = !e.context && e.canShift(Mh);
      r.acceptToken(i ? Mh : e1);
    }
  } else t == p1 && r.peek(1) == m1 && (r.advance(), r.advance(), (r.next < 48 || r.next > 57) && r.acceptToken(t1));
}, { contextual: !0 });
function Ms(r, e) {
  return r >= 65 && r <= 90 || r >= 97 && r <= 122 || r == 95 || r >= 192 || !e && r >= 48 && r <= 57;
}
const x1 = new Ke((r, e) => {
  if (r.next != d1 || !e.dialectEnabled(a1) || (r.advance(), r.next == Do)) return;
  let t = 0;
  for (; Yo.indexOf(r.next) > -1; )
    r.advance(), t++;
  if (Ms(r.next, !0)) {
    for (r.advance(), t++; Ms(r.next, !1); )
      r.advance(), t++;
    for (; Yo.indexOf(r.next) > -1; )
      r.advance(), t++;
    if (r.next == O1) return;
    for (let i = 0; ; i++) {
      if (i == 7) {
        if (!Ms(r.next, !0)) return;
        break;
      }
      if (r.next != "extends".charCodeAt(i)) break;
      r.advance(), t++;
    }
  }
  r.acceptToken(i1, -t);
}), k1 = ii({
  "get set async static": u.modifier,
  "for while do if else switch try catch finally return throw break continue default case": u.controlKeyword,
  "in of await yield void typeof delete instanceof": u.operatorKeyword,
  "let var const using function class extends": u.definitionKeyword,
  "import export from": u.moduleKeyword,
  "with debugger as new": u.keyword,
  TemplateString: u.special(u.string),
  super: u.atom,
  BooleanLiteral: u.bool,
  this: u.self,
  null: u.null,
  Star: u.modifier,
  VariableName: u.variableName,
  "CallExpression/VariableName TaggedTemplateExpression/VariableName": u.function(u.variableName),
  VariableDefinition: u.definition(u.variableName),
  Label: u.labelName,
  PropertyName: u.propertyName,
  PrivatePropertyName: u.special(u.propertyName),
  "CallExpression/MemberExpression/PropertyName": u.function(u.propertyName),
  "FunctionDeclaration/VariableDefinition": u.function(u.definition(u.variableName)),
  "ClassDeclaration/VariableDefinition": u.definition(u.className),
  PropertyDefinition: u.definition(u.propertyName),
  PrivatePropertyDefinition: u.definition(u.special(u.propertyName)),
  UpdateOp: u.updateOperator,
  "LineComment Hashbang": u.lineComment,
  BlockComment: u.blockComment,
  Number: u.number,
  String: u.string,
  Escape: u.escape,
  ArithOp: u.arithmeticOperator,
  LogicOp: u.logicOperator,
  BitOp: u.bitwiseOperator,
  CompareOp: u.compareOperator,
  RegExp: u.regexp,
  Equals: u.definitionOperator,
  Arrow: u.function(u.punctuation),
  ": Spread": u.punctuation,
  "( )": u.paren,
  "[ ]": u.squareBracket,
  "{ }": u.brace,
  "InterpolationStart InterpolationEnd": u.special(u.brace),
  ".": u.derefOperator,
  ", ;": u.separator,
  "@": u.meta,
  TypeName: u.typeName,
  TypeDefinition: u.definition(u.typeName),
  "type enum interface implements namespace module declare": u.definitionKeyword,
  "abstract global Privacy readonly override": u.modifier,
  "is keyof unique infer": u.operatorKeyword,
  JSXAttributeValue: u.attributeValue,
  JSXText: u.content,
  "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": u.angleBracket,
  "JSXIdentifier JSXNameSpacedName": u.tagName,
  "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": u.attributeName,
  "JSXBuiltin/JSXIdentifier": u.standard(u.tagName)
}), Q1 = { __proto__: null, export: 20, as: 25, from: 33, default: 36, async: 41, function: 42, extends: 54, this: 58, true: 66, false: 66, null: 78, void: 82, typeof: 86, super: 102, new: 136, delete: 148, yield: 157, await: 161, class: 166, public: 229, private: 229, protected: 229, readonly: 231, instanceof: 250, satisfies: 253, in: 254, const: 256, import: 290, keyof: 345, unique: 349, infer: 355, is: 391, abstract: 411, implements: 413, type: 415, let: 418, var: 420, using: 423, interface: 429, enum: 433, namespace: 439, module: 441, declare: 445, global: 449, for: 468, of: 477, while: 480, with: 484, do: 488, if: 492, else: 494, switch: 498, case: 504, try: 510, catch: 514, finally: 518, return: 522, throw: 526, break: 530, continue: 534, debugger: 538 }, w1 = { __proto__: null, async: 123, get: 125, set: 127, declare: 189, public: 191, private: 191, protected: 191, static: 193, abstract: 195, override: 197, readonly: 203, accessor: 205, new: 395 }, P1 = { __proto__: null, "<": 187 }, $1 = Gt.deserialize({
  version: 14,
  states: "$@QO%TQ^OOO%[Q^OOO'_Q`OOP(lOWOOO*zQ?NdO'#CiO+RO!bO'#CjO+aO#tO'#CjO+oO!0LbO'#D^O.QQ^O'#DdO.bQ^O'#DoO%[Q^O'#DwO0fQ^O'#EPOOQ?Mr'#EX'#EXO1PQWO'#EUOOQO'#Em'#EmOOQO'#Ih'#IhO1XQWO'#GpO1dQWO'#ElO1iQWO'#ElO3hQ?NdO'#JmO6[Q?NdO'#JnO6uQWO'#F[O6zQ&jO'#FsOOQ?Mr'#Fe'#FeO7VO,YO'#FeO7eQ7[O'#FzO9RQWO'#FyOOQ?Mr'#Jn'#JnOOQ?Mp'#Jm'#JmO9WQWO'#GtOOQU'#KZ'#KZO9cQWO'#IUO9hQ?MxO'#IVOOQU'#JZ'#JZOOQU'#IZ'#IZQ`Q^OOO`Q^OOO9pQMnO'#DsO9wQ^O'#D{O:OQ^O'#D}O9^QWO'#GpO:VQ7[O'#CoO:eQWO'#EkO:pQWO'#EvO:uQ7[O'#FdO;dQWO'#GpOOQO'#K['#K[O;iQWO'#K[O;wQWO'#GxO;wQWO'#GyO;wQWO'#G{O9^QWO'#HOO<nQWO'#HRO>VQWO'#CeO>gQWO'#H_O>oQWO'#HeO>oQWO'#HgO`Q^O'#HiO>oQWO'#HkO>oQWO'#HnO>tQWO'#HtO>yQ?MyO'#HzO%[Q^O'#H|O?UQ?MyO'#IOO?aQ?MyO'#IQO9hQ?MxO'#ISO?lQ?NdO'#CiO@nQ`O'#DiQOQWOOO%[Q^O'#D}OAUQWO'#EQO:VQ7[O'#EkOAaQWO'#EkOAlQpO'#FdOOQU'#Cg'#CgOOQ?Mp'#Dn'#DnOOQ?Mp'#Jq'#JqO%[Q^O'#JqOOQO'#Jt'#JtOOQO'#Id'#IdOBlQ`O'#EdOOQ?Mp'#Ec'#EcOOQ?Mp'#Jx'#JxOChQ?NQO'#EdOCrQ`O'#ETOOQO'#Js'#JsODWQ`O'#JtOEeQ`O'#ETOCrQ`O'#EdPErO#@ItO'#CbPOOO)CDx)CDxOOOO'#I['#I[OE}O!bO,59UOOQ?Mr,59U,59UOOOO'#I]'#I]OF]O#tO,59UO%[Q^O'#D`OOOO'#I_'#I_OFkO!0LbO,59xOOQ?Mr,59x,59xOFyQ^O'#I`OG^QWO'#JoOI]QrO'#JoO+}Q^O'#JoOIdQWO,5:OOIzQWO'#EmOJXQWO'#KOOJdQWO'#J}OJdQWO'#J}OJlQWO,5;ZOJqQWO'#J|OOQ?Mv,5:Z,5:ZOJxQ^O,5:ZOLvQ?NdO,5:cOMgQWO,5:kONQQ?MxO'#J{ONXQWO'#JzO9WQWO'#JzONmQWO'#JzONuQWO,5;YONzQWO'#JzO!#PQrO'#JnOOQ?Mr'#Ci'#CiO%[Q^O'#EPO!#oQrO,5:pOOQQ'#Ju'#JuOOQO-E<f-E<fO9^QWO,5=[O!$VQWO,5=[O!$[Q^O,5;WO!&_Q7[O'#EhO!'xQWO,5;WO!'}Q^O'#DvO!(XQ`O,5;aO!(aQ`O,5;aO%[Q^O,5;aOOQU'#FS'#FSOOQU'#FU'#FUO%[Q^O,5;bO%[Q^O,5;bO%[Q^O,5;bO%[Q^O,5;bO%[Q^O,5;bO%[Q^O,5;bO%[Q^O,5;bO%[Q^O,5;bO%[Q^O,5;bO%[Q^O,5;bOOQU'#FY'#FYO!(oQ^O,5;sOOQ?Mr,5;x,5;xOOQ?Mr,5;y,5;yOOQ?Mr,5;{,5;{O%[Q^O'#IlO!*rQ?MxO,5<gO%[Q^O,5;bO!&_Q7[O,5;bO!+aQ7[O,5;bO!-RQ7[O'#EZO%[Q^O,5;vOOQ?Mr,5;z,5;zO!-YQ&jO'#FiO!.VQ&jO'#KSO!-qQ&jO'#KSO!.^Q&jO'#KSOOQO'#KS'#KSO!.rQ&jO,5<ROOOS,5<_,5<_O!/TQ^O'#FuOOOS'#Ik'#IkO7VO,YO,5<PO!/[Q&jO'#FwOOQ?Mr,5<P,5<PO!/{Q!LQO'#CvOOQ?Mr'#Cz'#CzO!0`O!0LbO'#DOO!0|Q7[O,5<dO!1TQWO,5<fO!2pQ$ISO'#GVO!2}QWO'#GWO!3SQWO'#GWO!4rQ$ISO'#G[O!5nQ`O'#G`OOQO'#Gk'#GkO!+hQ7[O'#GjOOQO'#Gm'#GmO!+hQ7[O'#GlO!6aQ!LQO'#JgOOQ?Mr'#Jg'#JgO!6kQWO'#JfO!6yQWO'#JeO!7RQWO'#CuOOQ?Mr'#Cx'#CxO!7ZQWO'#CzOOQ?Mr'#DS'#DSOOQ?Mr'#DU'#DUO1SQWO'#DWO!+hQ7[O'#F}O!+hQ7[O'#GPO!7`QWO'#GRO!7eQWO'#GSO!3SQWO'#GYO!+hQ7[O'#G_O!7jQWO'#EnO!8XQWO,5<eOOQ?Mp'#Cr'#CrO!8aQWO'#EoO!9ZQ`O'#EpOOQ?Mp'#J|'#J|O!9bQ?MxO'#K]O9hQ?MxO,5=`O`Q^O,5>pOOQU'#Jc'#JcOOQU,5>q,5>qOOQU-E<X-E<XO!;aQ?NdO,5:_O!9UQ`O,5:]O!=zQ?NdO,5:gO%[Q^O,5:gO!@bQ?NdO,5:iOOQO,5@v,5@vO!ARQ7[O,5=[O!AaQ?MxO'#JdO9RQWO'#JdO!ArQ?MxO,59ZO!A}Q`O,59ZO!BVQ7[O,59ZO:VQ7[O,59ZO!BbQWO,5;WO!BjQWO'#H^O!COQWO'#K`O%[Q^O,5;|O!9UQ`O,5<OO!CWQWO,5=wO!C]QWO,5=wO!CbQWO,5=wO9hQ?MxO,5=wO;wQWO,5=gOOQO'#Cv'#CvO!CpQ`O,5=dO!CxQ7[O,5=eO!DTQWO,5=gO!DYQpO,5=jO!DbQWO'#K[O>tQWO'#HTO9^QWO'#HVO!DgQWO'#HVO:VQ7[O'#HXO!DlQWO'#HXOOQU,5=m,5=mO!DqQWO'#HYO!ESQWO'#CoO!EXQWO,59PO!EcQWO,59PO!GhQ^O,59POOQU,59P,59PO!GxQ?MxO,59PO%[Q^O,59PO!JTQ^O'#HaOOQU'#Hb'#HbOOQU'#Hc'#HcO`Q^O,5=yO!JkQWO,5=yO`Q^O,5>PO`Q^O,5>RO!JpQWO,5>TO`Q^O,5>VO!JuQWO,5>YO!JzQ^O,5>`OOQU,5>f,5>fO%[Q^O,5>fO9hQ?MxO,5>hOOQU,5>j,5>jO# UQWO,5>jOOQU,5>l,5>lO# UQWO,5>lOOQU,5>n,5>nO# rQ`O'#D[O%[Q^O'#JqO# |Q`O'#JqO#!kQ`O'#DjO#!|Q`O'#DjO#%_Q^O'#DjO#%fQWO'#JpO#%nQWO,5:TO#%sQWO'#EqO#&RQWO'#KPO#&ZQWO,5;[O#&`Q`O'#DjO#&mQ`O'#ESOOQ?Mr,5:l,5:lO%[Q^O,5:lO#&tQWO,5:lO>tQWO,5;VO!A}Q`O,5;VO!BVQ7[O,5;VO:VQ7[O,5;VO#&|QWO,5@]O#'RQ(CYO,5:pOOQO-E<b-E<bO#(XQ?NQO,5;OOCrQ`O,5:oO#(cQ`O,5:oOCrQ`O,5;OO!ArQ?MxO,5:oOOQ?Mp'#Eg'#EgOOQO,5;O,5;OO%[Q^O,5;OO#(pQ?MxO,5;OO#({Q?MxO,5;OO!A}Q`O,5:oOOQO,5;U,5;UO#)ZQ?MxO,5;OPOOO'#IY'#IYP#)oO#@ItO,58|POOO,58|,58|OOOO-E<Y-E<YOOQ?Mr1G.p1G.pOOOO-E<Z-E<ZO#)zQpO,59zOOOO-E<]-E<]OOQ?Mr1G/d1G/dO#*PQrO,5>zO+}Q^O,5>zOOQO,5?Q,5?QO#*ZQ^O'#I`OOQO-E<^-E<^O#*hQWO,5@ZO#*pQrO,5@ZO#*wQWO,5@iOOQ?Mr1G/j1G/jO%[Q^O,5@jO#+PQWO'#IfOOQO-E<d-E<dO#*wQWO,5@iOOQ?Mp1G0u1G0uOOQ?Mv1G/u1G/uOOQ?Mv1G0V1G0VO%[Q^O,5@gO#+eQ?MxO,5@gO#+vQ?MxO,5@gO#+}QWO,5@fO9WQWO,5@fO#,VQWO,5@fO#,eQWO'#IiO#+}QWO,5@fOOQ?Mp1G0t1G0tO!(XQ`O,5:rO!(dQ`O,5:rOOQQ,5:t,5:tO#-VQYO,5:tO#-_Q7[O1G2vO9^QWO1G2vOOQ?Mr1G0r1G0rO#-mQ?NdO1G0rO#.rQ?NbO,5;SOOQ?Mr'#GU'#GUO#/`Q?NdO'#JgO!$[Q^O1G0rO#1hQrO'#JrO%[Q^O'#JrO#1rQWO,5:bOOQ?Mr'#D['#D[OOQ?Mr1G0{1G0{O%[Q^O1G0{OOQ?Mr1G1e1G1eO#1wQWO1G0{O#4]Q?NdO1G0|O#4dQ?NdO1G0|O#6zQ?NdO1G0|O#7RQ?NdO1G0|O#9iQ?NdO1G0|O#<PQ?NdO1G0|O#<WQ?NdO1G0|O#<_Q?NdO1G0|O#>uQ?NdO1G0|O#>|Q?NdO1G0|O#AZQ07bO'#CiO#CUQ07bO1G1_O#C]Q07bO'#JnO#CpQ?NdO,5?WOOQ?Mp-E<j-E<jO#E}Q?NdO1G0|O#FzQ?NdO1G0|OOQ?Mr1G0|1G0|O#GzQ7[O'#JwO#HUQWO,5:uO#HZQ?NdO1G1bO#H}Q&jO,5<VO#IVQ&jO,5<WO#I_Q&jO'#FnO#IvQWO'#FmOOQO'#KT'#KTOOQO'#Ij'#IjO#I{Q&jO1G1mOOQ?Mr1G1m1G1mOOOS1G1x1G1xO#J^Q07bO'#JmO#JhQWO,5<aO!(oQ^O,5<aOOOS-E<i-E<iOOQ?Mr1G1k1G1kO#JmQ`O'#KSOOQ?Mr,5<c,5<cO#JuQ`O,5<cO!&_Q7[O'#DQOOOO'#I^'#I^O#JzO!0LbO,59jOOQ?Mr,59j,59jO%[Q^O1G2OO!7eQWO'#InO#KVQ7[O,5<xOOQ?Mr,5<u,5<uO!+hQ7[O'#IqO#KuQ7[O,5=UO!+hQ7[O'#IsO#LhQ7[O,5=WO!&_Q7[O,5=YOOQO1G2Q1G2QO#LrQpO'#CrO#MVQ$ISO'#EoO#NUQ`O'#G`O#NrQpO,5<qO#NyQWO'#KWO9WQWO'#KWO$ XQWO,5<sO!+hQ7[O,5<rO$ ^QWO'#GXO$ oQWO,5<rO$ tQpO'#GUO$!RQpO'#KXO$!]QWO'#KXO!&_Q7[O'#KXO$!bQWO,5<vO$!gQ`O'#GaO!5iQ`O'#GaO$!xQWO'#GcO$!}QWO'#GeO!3SQWO'#GhO$#SQ?MxO'#IpO$#_Q`O,5<zOOQ?Mv,5<z,5<zO$#fQ`O'#GaO$#tQ`O'#GbO$#|Q`O'#GbO$$RQ7[O,5=UO$$cQ7[O,5=WOOQ?Mr,5=Z,5=ZO!+hQ7[O,5@QO!+hQ7[O,5@QO$$sQWO'#IuO$%OQWO,5@PO$%WQWO,59aOOQ?Mr,59f,59fO$%zQ!LSO,59rOOQ?Mr'#Jk'#JkO$&mQ7[O,5<iO$'`Q7[O,5<kO@fQWO,5<mOOQ?Mr,5<n,5<nO$'jQWO,5<tO$'oQ7[O,5<yO$(PQWO'#JzO!$[Q^O1G2PO$(UQWO1G2PO9WQWO'#J}O9WQWO'#EqO%[Q^O'#EqO9WQWO'#IwO$(ZQ?MxO,5@wOOQU1G2z1G2zOOQU1G4[1G4[OOQ?Mr1G/y1G/yOOQ?Mr1G/w1G/wO$*]Q?NdO1G0ROOQU1G2v1G2vO!&_Q7[O1G2vO%[Q^O1G2vO#-bQWO1G2vO$,aQ7[O'#EhOOQ?Mp,5@O,5@OO$,kQ?MxO,5@OOOQU1G.u1G.uO!ArQ?MxO1G.uO!A}Q`O1G.uO!BVQ7[O1G.uO$,|QWO1G0rO$-RQWO'#CiO$-^QWO'#KaO$-fQWO,5=xO$-kQWO'#KaO$-pQWO'#KaO$.OQWO'#I}O$.^QWO,5@zO$.fQrO1G1hOOQ?Mr1G1j1G1jO9^QWO1G3cO@fQWO1G3cO$.mQWO1G3cO$.rQWO1G3cOOQU1G3c1G3cO!DTQWO1G3RO!&_Q7[O1G3OO$.wQWO1G3OOOQU1G3P1G3PO!&_Q7[O1G3PO$.|QWO1G3PO$/UQ`O'#G}OOQU1G3R1G3RO!5iQ`O'#IyO!DYQpO1G3UOOQU1G3U1G3UOOQU,5=o,5=oO$/^Q7[O,5=qO9^QWO,5=qO$!}QWO,5=sO9RQWO,5=sO!A}Q`O,5=sO!BVQ7[O,5=sO:VQ7[O,5=sO$/lQWO'#K_O$/wQWO,5=tOOQU1G.k1G.kO$/|Q?MxO1G.kO@fQWO1G.kO$0XQWO1G.kO9hQ?MxO1G.kO$2aQrO,5@|O$2nQWO,5@|O9WQWO,5@|O$2yQ^O,5={O$3QQWO,5={OOQU1G3e1G3eO`Q^O1G3eOOQU1G3k1G3kOOQU1G3m1G3mO>oQWO1G3oO$3VQ^O1G3qO$7ZQ^O'#HpOOQU1G3t1G3tO$7hQWO'#HvO>tQWO'#HxOOQU1G3z1G3zO$7pQ^O1G3zO9hQ?MxO1G4QOOQU1G4S1G4SOOQ?Mp'#G]'#G]O9hQ?MxO1G4UO9hQ?MxO1G4WO$;wQWO,5@]O!(oQ^O,5;]O9WQWO,5;]O>tQWO,5:UO!(oQ^O,5:UO!A}Q`O,5:UO$;|Q07bO,5:UOOQO,5;],5;]O$<WQ`O'#IaO$<nQWO,5@[OOQ?Mr1G/o1G/oO$<vQ`O'#IgO$=QQWO,5@kOOQ?Mp1G0v1G0vO#!|Q`O,5:UOOQO'#Ic'#IcO$=YQ`O,5:nOOQ?Mv,5:n,5:nO#&wQWO1G0WOOQ?Mr1G0W1G0WO%[Q^O1G0WOOQ?Mr1G0q1G0qO>tQWO1G0qO!A}Q`O1G0qO!BVQ7[O1G0qOOQ?Mp1G5w1G5wO!ArQ?MxO1G0ZOOQO1G0j1G0jO%[Q^O1G0jO$=aQ?MxO1G0jO$=lQ?MxO1G0jO!A}Q`O1G0ZOCrQ`O1G0ZO$=zQ?MxO1G0jOOQO1G0Z1G0ZO$>`Q?NdO1G0jPOOO-E<W-E<WPOOO1G.h1G.hOOOO1G/f1G/fO$>jQpO,5<gO$>rQrO1G4fOOQO1G4l1G4lO%[Q^O,5>zO$>|QWO1G5uO$?UQWO1G6TO$?^QrO1G6UO9WQWO,5?QO$?hQ?NdO1G6RO%[Q^O1G6RO$?xQ?MxO1G6RO$@ZQWO1G6QO$@ZQWO1G6QO9WQWO1G6QO$@cQWO,5?TO9WQWO,5?TOOQO,5?T,5?TO$@wQWO,5?TO$(PQWO,5?TOOQO-E<g-E<gOOQQ1G0^1G0^OOQQ1G0`1G0`O#-YQWO1G0`OOQU7+(b7+(bO!&_Q7[O7+(bO%[Q^O7+(bO$AVQWO7+(bO$AbQ7[O7+(bO$ApQ?NdO,5=UO$CxQ?NdO,5=WO$FQQ?NdO,5=UO$H`Q?NdO,5=WO$JnQ?NdO,59rO$LsQ?NdO,5<iO$N{Q?NdO,5<kO%#TQ?NdO,5<yOOQ?Mr7+&^7+&^O%%cQ?NdO7+&^O%&VQ^O'#IbO%&dQWO,5@^O%&lQrO,5@^OOQ?Mr1G/|1G/|O%&vQWO7+&gOOQ?Mr7+&g7+&gO%&{Q07bO,5:cO%[Q^O7+&yO%'VQ07bO,5:_O%'dQ07bO,5:gO%'nQ07bO,5:iO%'xQ7[O'#IeO%(SQWO,5@cOOQ?Mr1G0a1G0aOOQO1G1q1G1qOOQO1G1r1G1rO%([QtO,5<YO!(oQ^O,5<XOOQO-E<h-E<hOOQ?Mr7+'X7+'XOOOS7+'d7+'dOOOS1G1{1G1{O%(gQWO1G1{OOQ?Mr1G1}1G1}O%(lQpO,59lOOOO-E<[-E<[OOQ?Mr1G/U1G/UO%(sQ?NdO7+'jOOQ?Mr,5?Y,5?YO%)gQpO,5?YOOQ?Mr1G2d1G2dP!&_Q7[O'#InPOQ?Mr-E<l-E<lO%*VQ7[O,5?]OOQ?Mr-E<o-E<oO%*xQ7[O,5?_OOQ?Mr-E<q-E<qO%+SQpO1G2tO%+ZQpO'#CrO%+qQ7[O'#J}O%+xQ^O'#EqOOQ?Mr1G2]1G2]O%,SQWO'#ImO%,hQWO,5@rO%,hQWO,5@rO%,pQWO,5@rO%,{QWO,5@rOOQO1G2_1G2_O%-ZQ7[O1G2^O!+hQ7[O1G2^O%-kQ$ISO'#IoO%-xQWO,5@sO!&_Q7[O,5@sO%.QQpO,5@sOOQ?Mr1G2b1G2bOOQ?Mp,5<{,5<{OOQ?Mp,5<|,5<|O$(PQWO,5<|OCcQWO,5<|O!A}Q`O,5<{OOQO'#Gd'#GdO%.[QWO,5<}OOQ?Mp,5=P,5=PO$(PQWO,5=SOOQO,5?[,5?[OOQO-E<n-E<nOOQ?Mv1G2f1G2fO!5iQ`O,5<{O%.dQWO,5<|O$!xQWO,5<}O%.oQ`O,5<|O!+hQ7[O'#IqO%/`Q7[O1G2pO!+hQ7[O'#IsO%0RQ7[O1G2rO%0]Q7[O1G5lO%0gQ7[O1G5lOOQO,5?a,5?aOOQO-E<s-E<sOOQO1G.{1G.{O!9UQ`O,59tO%[Q^O,59tOOQ?Mr,5<h,5<hO%0tQWO1G2XO!+hQ7[O1G2`O%0yQ?NdO7+'kOOQ?Mr7+'k7+'kO!$[Q^O7+'kO%1mQWO,5;]OOQ?Mp,5?c,5?cOOQ?Mp-E<u-E<uO%1rQpO'#KYO#&wQWO7+(bO4UQrO7+(bO$AYQWO7+(bO%1|Q?NbO'#CiO%2aQ?NbO,5=QO%3RQWO,5=QOOQ?Mp1G5j1G5jOOQU7+$a7+$aO!ArQ?MxO7+$aO!A}Q`O7+$aO!$[Q^O7+&^O%3WQWO'#I|O%3oQWO,5@{OOQO1G3d1G3dO9^QWO,5@{O%3oQWO,5@{O%3wQWO,5@{OOQO,5?i,5?iOOQO-E<{-E<{OOQ?Mr7+'S7+'SO%3|QWO7+(}O9hQ?MxO7+(}O9^QWO7+(}O@fQWO7+(}OOQU7+(m7+(mO%4RQ?NbO7+(jO!&_Q7[O7+(jO%4]QpO7+(kOOQU7+(k7+(kO!&_Q7[O7+(kO%4dQWO'#K^O%4oQWO,5=iOOQO,5?e,5?eOOQO-E<w-E<wOOQU7+(p7+(pO%6RQ`O'#HWOOQU1G3]1G3]O!&_Q7[O1G3]O%[Q^O1G3]O%6YQWO1G3]O%6eQ7[O1G3]O9hQ?MxO1G3_O$!}QWO1G3_O9RQWO1G3_O!A}Q`O1G3_O!BVQ7[O1G3_O%6sQWO'#I{O%7XQWO,5@yO%7aQ`O,5@yOOQ?Mp1G3`1G3`OOQU7+$V7+$VO@fQWO7+$VO9hQ?MxO7+$VO%7lQWO7+$VO%[Q^O1G6hO%[Q^O1G6iO%7qQ?MxO1G6hO%7{Q^O1G3gO%8SQWO1G3gO%8XQ^O1G3gOOQU7+)P7+)PO9hQ?MxO7+)ZO`Q^O7+)]OOQU'#Kd'#KdOOQU'#JO'#JOO%8`Q^O,5>[OOQU,5>[,5>[O%[Q^O'#HqO%8mQWO'#HsOOQU,5>b,5>bO9WQWO,5>bOOQU,5>d,5>dOOQU7+)f7+)fOOQU7+)l7+)lOOQU7+)p7+)pOOQU7+)r7+)rO%8rQ`O1G5wO%9WQ07bO1G0wO%9bQWO1G0wOOQO1G/p1G/pO%9mQ07bO1G/pO>tQWO1G/pO!(oQ^O'#DjOOQO,5>{,5>{OOQO-E<_-E<_OOQO,5?R,5?ROOQO-E<e-E<eO!A}Q`O1G/pOOQO-E<a-E<aOOQ?Mv1G0Y1G0YOOQ?Mr7+%r7+%rO#&wQWO7+%rOOQ?Mr7+&]7+&]O>tQWO7+&]O!A}Q`O7+&]OOQO7+%u7+%uO$>`Q?NdO7+&UOOQO7+&U7+&UO%[Q^O7+&UO%9wQ?MxO7+&UO!ArQ?MxO7+%uO!A}Q`O7+%uO%:SQ?MxO7+&UO%:bQ?NdO7++mO%[Q^O7++mO%:rQWO7++lO%:rQWO7++lOOQO1G4o1G4oO9WQWO1G4oO%:zQWO1G4oOOQQ7+%z7+%zO#&wQWO<<K|O4UQrO<<K|O%;YQWO<<K|OOQU<<K|<<K|O!&_Q7[O<<K|O%[Q^O<<K|O%;bQWO<<K|O%;mQ?NdO,5?]O%=uQ?NdO,5?_O%?}Q?NdO1G2^O%B]Q?NdO1G2pO%DeQ?NdO1G2rO%FmQrO,5>|O%[Q^O,5>|OOQO-E<`-E<`O%FwQWO1G5xOOQ?Mr<<JR<<JRO%GPQ07bO1G0rO%IWQ07bO1G0|O%I_Q07bO1G0|O%K`Q07bO1G0|O%KgQ07bO1G0|O%MhQ07bO1G0|O& iQ07bO1G0|O& pQ07bO1G0|O& wQ07bO1G0|O&#xQ07bO1G0|O&$PQ07bO1G0|O&$WQ?NdO<<JeO&&OQ07bO1G0|O&&{Q07bO1G0|O&'{Q07bO'#JgO&*OQ07bO1G1bO&*]Q07bO1G0RO&*gQ7[O,5?POOQO-E<c-E<cO!(oQ^O'#FpOOQO'#KU'#KUOOQO1G1t1G1tO&*qQWO1G1sO&*vQ07bO,5?WOOOS7+'g7+'gOOOO1G/W1G/WOOQ?Mr1G4t1G4tO!+hQ7[O7+(`O&-WQrO'#CiO&-bQWO,5?XO9WQWO,5?XOOQO-E<k-E<kO&-pQWO1G6^O&-pQWO1G6^O&-xQWO1G6^O&.TQ7[O7+'xO&.eQpO,5?ZO&.oQWO,5?ZO!&_Q7[O,5?ZOOQO-E<m-E<mO&.tQpO1G6_O&/OQWO1G6_OOQ?Mp1G2h1G2hO$(PQWO1G2hOOQ?Mp1G2g1G2gO&/WQWO1G2iO!&_Q7[O1G2iOOQ?Mp1G2n1G2nO!A}Q`O1G2gOCcQWO1G2hO&/]QWO1G2iO&/eQWO1G2hO$!xQWO1G2iO&0XQ7[O,5?]OOQ?Mr-E<p-E<pO&0zQ7[O,5?_OOQ?Mr-E<r-E<rO!+hQ7[O7++WOOQ?Mr1G/`1G/`O&1UQWO1G/`OOQ?Mr7+'s7+'sO&1ZQ7[O7+'zO&1kQ?NdO<<KVOOQ?Mr<<KV<<KVO&2_QWO1G0wO!&_Q7[O'#IvO&2dQWO,5@tO&4fQrO<<K|O!&_Q7[O1G2lOOQU<<G{<<G{O!ArQ?MxO<<G{O&4mQ?NdO<<IxOOQ?Mr<<Ix<<IxOOQO,5?h,5?hO&5aQWO,5?hO&5fQWO,5?hOOQO-E<z-E<zO&5tQWO1G6gO&5tQWO1G6gO9^QWO1G6gO@fQWO<<LiOOQU<<Li<<LiO&5|QWO<<LiO9hQ?MxO<<LiOOQU<<LU<<LUO%4RQ?NbO<<LUOOQU<<LV<<LVO%4]QpO<<LVO&6RQ`O'#IxO&6^QWO,5@xO!(oQ^O,5@xOOQU1G3T1G3TO%+xQ^O'#JqOOQO'#Iz'#IzO9hQ?MxO'#IzO&6fQ`O,5=rOOQU,5=r,5=rO&6mQ`O'#EdO&7RQ`O'#GcO&7WQWO7+(wO&7]QWO7+(wOOQU7+(w7+(wO!&_Q7[O7+(wO%[Q^O7+(wO&7eQWO7+(wOOQU7+(y7+(yO9hQ?MxO7+(yO$!}QWO7+(yO9RQWO7+(yO!A}Q`O7+(yO&7pQWO,5?gOOQO-E<y-E<yOOQO'#HZ'#HZO&7{QWO1G6eO9hQ?MxO<<GqOOQU<<Gq<<GqO@fQWO<<GqO&8TQWO7+,SO&8YQWO7+,TO%[Q^O7+,SO%[Q^O7+,TOOQU7+)R7+)RO&8_QWO7+)RO&8dQ^O7+)RO&8kQWO7+)ROOQU<<Lu<<LuOOQU<<Lw<<LwOOQU-E<|-E<|OOQU1G3v1G3vO&8pQWO,5>]OOQU,5>_,5>_O&8uQWO1G3|O9WQWO7+&cO!(oQ^O7+&cOOQO7+%[7+%[O&8zQ07bO1G6UO>tQWO7+%[OOQ?Mr<<I^<<I^OOQ?Mr<<Iw<<IwO>tQWO<<IwOOQO<<Ip<<IpO$>`Q?NdO<<IpO%[Q^O<<IpOOQO<<Ia<<IaO!ArQ?MxO<<IaO&9UQ?MxO<<IpO&9aQ?NdO<= XO&9qQWO<= WOOQO7+*Z7+*ZO9WQWO7+*ZOOQUANAhANAhO&9yQrOANAhO!&_Q7[OANAhO#&wQWOANAhO4UQrOANAhO&:QQWOANAhO%[Q^OANAhO&:YQ?NdO7+'xO&<hQ?NdO,5?]O&>pQ?NdO,5?_O&@xQ?NdO7+'zO&CWQrO1G4hO&CbQ07bO7+&^O&EcQ07bO,5=UO&GgQ07bO,5=WO&GwQ07bO,5=UO&HXQ07bO,5=WO&HiQ07bO,59rO&JlQ07bO,5<iO&LlQ07bO,5<kO&N}Q07bO,5<yO'!pQ07bO7+'jO'!}Q07bO7+'kO'#[QWO,5<[OOQO7+'_7+'_O'#aQ7[O<<KzOOQO1G4s1G4sO'#hQWO1G4sO'#sQWO1G4sO'$RQWO7++xO'$RQWO7++xO!&_Q7[O1G4uO'$ZQpO1G4uO'$eQWO7++yOOQ?Mp7+(S7+(SO'$mQWO7+(TO'$xQpO7+(TOOQ?Mp7+(R7+(RO$(PQWO7+(SO'%PQWO7+(TO!&_Q7[O7+(TOCcQWO7+(SO'%UQWO7+(TO'%^Q7[O<<NrOOQ?Mr7+$z7+$zO'%hQpO,5?bOOQO-E<t-E<tO'%rQ?NbO7+(WOOQUAN=gAN=gO9^QWO1G5SOOQO1G5S1G5SO'&SQWO1G5SO'&XQWO7+,RO'&XQWO7+,RO9hQ?MxOANBTO@fQWOANBTOOQUANBTANBTOOQUANApANApOOQUANAqANAqO'&aQWO,5?dOOQO-E<v-E<vO'&lQ07bO1G6dOOQO,5?f,5?fOOQO-E<x-E<xOOQU1G3^1G3^O%+xQ^O,5<}O'&vQWO,5<}OOQU<<Lc<<LcO!&_Q7[O<<LcO&7WQWO<<LcO'&{QWO<<LcO%[Q^O<<LcOOQU<<Le<<LeO9hQ?MxO<<LeO$!}QWO<<LeO9RQWO<<LeO''TQ`O1G5RO''`QWO7+,POOQUAN=]AN=]O9hQ?MxOAN=]OOQU<= n<= nOOQU<= o<= oO''hQWO<= nO''mQWO<= oOOQU<<Lm<<LmO''rQWO<<LmO''wQ^O<<LmOOQU1G3w1G3wO>tQWO7+)hO'(OQWO<<I}O'(ZQ07bO<<I}OOQO<<Hv<<HvOOQ?MrAN?cAN?cOOQOAN?[AN?[O$>`Q?NdOAN?[OOQOAN>{AN>{O%[Q^OAN?[OOQO<<Mu<<MuOOQUG27SG27SO!&_Q7[OG27SO#&wQWOG27SO'(eQrOG27SO4UQrOG27SO'(lQWOG27SO'(tQ07bO<<JeO')RQ07bO1G2^O'*tQ07bO,5?]O',tQ07bO,5?_O'.tQ07bO1G2pO'0tQ07bO1G2rO'2tQ07bO<<KVO'3RQ07bO<<IxOOQO1G1v1G1vO!+hQ7[OANAfOOQO7+*_7+*_O'3`QWO7+*_O'3kQWO<= dO'3sQpO7+*aOOQ?Mp<<Ko<<KoO$(PQWO<<KoOCcQWO<<KoO'3}QWO<<KoOOQ?Mp<<Kn<<KnO'4YQpO<<KoO$(PQWO<<KnO'4aQWO<<KoO!&_Q7[O<<KoOOQO7+*n7+*nO9^QWO7+*nO'4fQWO<= mOOQUG27oG27oO9hQ?MxOG27oO!(oQ^O1G5OO'4nQWO7+,OO&7WQWOANA}OOQUANA}ANA}O!&_Q7[OANA}O'4vQWOANA}OOQUANBPANBPO9hQ?MxOANBPO$!}QWOANBPOOQO'#H['#H[OOQO7+*m7+*mOOQUG22wG22wOOQUANEYANEYOOQUANEZANEZOOQUANBXANBXO'5OQWOANBXOOQU<<MS<<MSO!(oQ^OAN?iOOQOG24vG24vO$>`Q?NdOG24vO#&wQWOLD,nOOQULD,nLD,nO!&_Q7[OLD,nO'5TQrOLD,nO'5[Q07bO7+'xO'6}Q07bO,5?]O'8}Q07bO,5?_O':}Q07bO7+'zO'<pQ7[OG27QOOQO<<My<<MyOOQ?MpANAZANAZO$(PQWOANAZOCcQWOANAZO'=QQWOANAZOOQ?MpANAYANAYO'=]QpOANAZOOQO<<NY<<NYOOQULD-ZLD-ZO'=dQ07bO7+*jOOQUG27iG27iO&7WQWOG27iO!&_Q7[OG27iOOQUG27kG27kO9hQ?MxOG27kOOQUG27sG27sO'=nQ07bOG25TOOQOLD*bLD*bOOQU!$(!Y!$(!YO#&wQWO!$(!YO!&_Q7[O!$(!YO'=xQ?NdOG27QOOQ?MpG26uG26uO$(PQWOG26uOCcQWOG26uO'@WQWOG26uOOQULD-TLD-TO&7WQWOLD-TOOQULD-VLD-VOOQU!)9Et!)9EtO#&wQWO!)9EtOOQ?MpLD,aLD,aO$(PQWOLD,aOCcQWOLD,aOOQU!$(!o!$(!oOOQU!.K;`!.K;`O'@cQ07bOG27QOOQ?Mp!$( {!$( {O$(PQWO!$( {OOQ?Mp!)9Eg!)9EgO!(oQ^O'#DwO1PQWO'#EUO'BUQrO'#JmO'B]QMnO'#DsO'BdQ^O'#D{O'BkQrO'#CiO'ERQrO'#CiO!(oQ^O'#D}O'EcQ^O,5;WO!(oQ^O,5;bO!(oQ^O,5;bO!(oQ^O,5;bO!(oQ^O,5;bO!(oQ^O,5;bO!(oQ^O,5;bO!(oQ^O,5;bO!(oQ^O,5;bO!(oQ^O,5;bO!(oQ^O,5;bO!(oQ^O'#IlO'GfQWO,5<gO!(oQ^O,5;bO'GnQ7[O,5;bO'IXQ7[O,5;bO!(oQ^O,5;vO!&_Q7[O'#GjO'GnQ7[O'#GjO!&_Q7[O'#GlO'GnQ7[O'#GlO1SQWO'#DWO1SQWO'#DWO!&_Q7[O'#F}O'GnQ7[O'#F}O!&_Q7[O'#GPO'GnQ7[O'#GPO!&_Q7[O'#G_O'GnQ7[O'#G_O!(oQ^O,5:gO'I`Q`O'#D[O!(oQ^O,5@jO'EcQ^O1G0rO'IjQ07bO'#CiO!(oQ^O1G2OO!&_Q7[O'#IqO'GnQ7[O'#IqO!&_Q7[O'#IsO'GnQ7[O'#IsO'ItQpO'#CrO!&_Q7[O,5<rO'GnQ7[O,5<rO'EcQ^O1G2PO!(oQ^O7+&yO!&_Q7[O1G2^O'GnQ7[O1G2^O!&_Q7[O'#IqO'GnQ7[O'#IqO!&_Q7[O'#IsO'GnQ7[O'#IsO!&_Q7[O1G2`O'GnQ7[O1G2`O'EcQ^O7+'kO'EcQ^O7+&^O!&_Q7[OANAfO'GnQ7[OANAfO'JXQWO'#ElO'J^QWO'#ElO'JfQWO'#F[O'JkQWO'#EvO'JpQWO'#KOO'J{QWO'#J|O'KWQWO,5;WO'K]Q7[O,5<dO'KdQWO'#GWO'KiQWO'#GWO'KnQWO,5<eO'KvQWO,5;WO'LOQ07bO1G1_O'LVQWO,5<rO'L[QWO,5<rO'LaQWO,5<tO'LfQWO,5<tO'LkQWO1G2PO'LpQWO1G0rO'LuQ7[O<<KzO'L|Q7[O<<KzO7eQ7[O'#FzO9RQWO'#FyOAaQWO'#EkO!(oQ^O,5;sO!3SQWO'#GWO!3SQWO'#GWO!3SQWO'#GYO!3SQWO'#GYO!+hQ7[O7+(`O!+hQ7[O7+(`O%+SQpO1G2tO%+SQpO1G2tO!&_Q7[O,5=YO!&_Q7[O,5=Y",
  stateData: "'NQ~O'wOS'xOSTOS'yRQ~OPYOQYOSfOY!VOaqOdzOeyOmkOoYOpkOqkOwkOyYO{YO!PWO!TkO!UkO![XO!fuO!iZO!lYO!mYO!nYO!pvO!rwO!uxO!y]O#t!PO$V|O%e}O%g!QO%i!OO%j!OO%k!OO%n!RO%p!SO%s!TO%t!TO%v!UO&S!WO&Y!XO&[!YO&^!ZO&`![O&c!]O&i!^O&o!_O&q!`O&s!aO&u!bO&w!cO(OSO(QTO(TUO([VO(j[O(yiO~OWtO~P`OPYOQYOSfOd!jOe!iOmkOoYOpkOqkOwkOyYO{YO!PWO!TkO!UkO![!eO!fuO!iZO!lYO!mYO!nYO!pvO!r!gO!u!hO$V!kO(O!dO(QTO(TUO([VO(j[O(yiO~Oa!wOp!nO!P!oO!_!yO!`!vO!a!vO!y;QO#Q!pO#R!pO#S!xO#T!pO#U!pO#X!zO#Y!zO(P!lO(QTO(TUO(`!mO(j!sO~O'y!{O~OP]XR]X[]Xa]Xo]X}]X!P]X!Y]X!i]X!m]X#O]X#P]X#]]X#hfX#k]X#l]X#m]X#n]X#o]X#p]X#q]X#r]X#s]X#u]X#w]X#y]X#z]X$P]X'u]X([]X(m]X(t]X(u]X~O!d%PX~P(qO_!}O(Q#PO(R!}O(S#PO~O_#QO(S#PO(T#PO(U#QO~Ou#SO!R#TO(]#TO(^#VO~OPYOQYOSfOd!jOe!iOmkOoYOpkOqkOwkOyYO{YO!PWO!TkO!UkO![!eO!fuO!iZO!lYO!mYO!nYO!pvO!r!gO!u!hO$V!kO(O;UO(QTO(TUO([VO(j[O(yiO~O!X#ZO!Y#WO!V(cP!V(qP~P+}O!Z#cO~P`OPYOQYOSfOd!jOe!iOoYOpkOqkOwkOyYO{YO!PWO!TkO!UkO![!eO!fuO!iZO!lYO!mYO!nYO!pvO!r!gO!u!hO$V!kO(QTO(TUO([VO(j[O(yiO~Om#mO!X#iO!y]O#f#lO#g#iO(O;VO!h(nP~P.iO!i#oO(O#nO~O!u#sO!y]O%e#tO~O#h#uO~O!d#vO#h#uO~OP$[OR#zO[$cOo$aO}#yO!P#{O!Y$_O!i#xO!m$[O#O$RO#k$OO#l$PO#m$PO#n$PO#o$QO#p$RO#q$RO#r$bO#s$RO#u$SO#w$UO#y$WO#z$XO([VO(m$YO(t#|O(u#}O~Oa(aX'u(aX's(aX!h(aX!V(aX![(aX%f(aX!d(aX~P1qO#P$dO#]$eO$P$eOP(bXR(bX[(bXo(bX}(bX!P(bX!Y(bX!i(bX!m(bX#O(bX#k(bX#l(bX#m(bX#n(bX#o(bX#p(bX#q(bX#r(bX#s(bX#u(bX#w(bX#y(bX#z(bX([(bX(m(bX(t(bX(u(bX![(bX%f(bX~Oa(bX'u(bX's(bX!V(bX!h(bXs(bX!d(bX~P4UO#]$eO~O$[$hO$^$gO$e$mO~OSfO![$nO$h$oO$j$qO~Oh%VOm%WOo%XOp$tOq$tOw%YOy%ZO{%[O!P${O![$|O!f%aO!i$xO#g%bO$V%_O$r%]O$t%^O$w%`O(O$sO(QTO(TUO([$uO(t$}O(u%POg(XP~O!i%cO~O!P%fO![%gO(O%eO~O!d%kO~Oa%lO'u%lO~O}%pO~P%[O(P!lO~P%[O%k%tO~P%[Oh%VO!i%cO(O%eO(P!lO~Oe%{O!i%cO(O%eO~O#s$RO~O}&QO![%}O!i&PO%g&TO(O%eO(P!lO(QTO(TUO`)SP~O!u#sO~O%p&VO!P)OX![)OX(O)OX~O(O&WO~O!r&]O#t!PO%g!QO%i!OO%j!OO%k!OO%n!RO%p!SO%s!TO%t!TO~Od&bOe&aO!u&_O%e&`O%x&^O~P;|Od&eOeyO![&dO!r&]O!uxO!y]O#t!PO%e}O%i!OO%j!OO%k!OO%n!RO%p!SO%s!TO%t!TO%v!UO~Ob&hO#]&kO%g&fO(P!lO~P=RO!i&lO!r&pO~O!i#oO~O![XO~Oa%lO't&xO'u%lO~Oa%lO't&{O'u%lO~Oa%lO't&}O'u%lO~O's]X!V]Xs]X!h]X&W]X![]X%f]X!d]X~P(qO!_'[O!`'TO!a'TO(P!lO(QTO(TUO~Op'RO!P'QO!X'UO(`'PO!Z(dP!Z(sP~P@YOk'_O![']O(O%eO~Oe'dO!i%cO(O%eO~O}&QO!i&PO~Op!nO!P!oO!y;QO#Q!pO#R!pO#T!pO#U!pO(P!lO(QTO(TUO(`!mO(j!sO~O!_'jO!`'iO!a'iO#S!pO#X'kO#Y'kO~PAtOa%lOh%VO!d#vO!i%cO'u%lO(m'mO~O!m'qO#]'oO~PCSOp!nO!P!oO(QTO(TUO(`!mO(j!sO~O![XOp(hX!P(hX!_(hX!`(hX!a(hX!y(hX#Q(hX#R(hX#S(hX#T(hX#U(hX#X(hX#Y(hX(P(hX(Q(hX(T(hX(`(hX(j(hX~O!`'iO!a'iO(P!lO~PCrO'z'uO'{'uO'|'wO~O_!}O(Q'yO(R!}O(S'yO~O_#QO(S'yO(T'yO(U#QO~Ou#SO!R#TO(]#TO(^'}O~O!X(PO!V'SX!V'YX!Y'SX!Y'YX~P+}O!Y(RO!V(cX~OP$[OR#zO[$cOo$aO}#yO!P#{O!Y(RO!i#xO!m$[O#O$RO#k$OO#l$PO#m$PO#n$PO#o$QO#p$RO#q$RO#r$bO#s$RO#u$SO#w$UO#y$WO#z$XO([VO(m$YO(t#|O(u#}O~O!V(cX~PGfO!V(WO~O!V(pX!Y(pX!d(pX!h(pX(m(pX~O#](pX#h#aX!Z(pX~PIiO#](XO!V(rX!Y(rX~O!Y(YO!V(qX~O!V(]O~O#]$eO~PIiO!Z(^O~P`OR#zO}#yO!P#{O!i#xO([VOP!ka[!kao!ka!Y!ka!m!ka#O!ka#k!ka#l!ka#m!ka#n!ka#o!ka#p!ka#q!ka#r!ka#s!ka#u!ka#w!ka#y!ka#z!ka(m!ka(t!ka(u!ka~Oa!ka'u!ka's!ka!V!ka!h!kas!ka![!ka%f!ka!d!ka~PKPO!h(_O~O!d#vO#](`O(m'mO!Y(oXa(oX'u(oX~O!h(oX~PMlO!P%fO![%gO!y]O#f(eO#g(dO(O%eO~O!Y(fO!h(nX~O!h(hO~O!P%fO![%gO#g(dO(O%eO~OP(bXR(bX[(bXo(bX}(bX!P(bX!Y(bX!i(bX!m(bX#O(bX#k(bX#l(bX#m(bX#n(bX#o(bX#p(bX#q(bX#r(bX#s(bX#u(bX#w(bX#y(bX#z(bX([(bX(m(bX(t(bX(u(bX~O!d#vO!h(bX~P! YOR(jO}(iO!i#xO#P$dO!y!xa!P!xa~O!u!xa%e!xa![!xa#f!xa#g!xa(O!xa~P!#ZO!u(nO~OPYOQYOSfOd!jOe!iOmkOoYOpkOqkOwkOyYO{YO!PWO!TkO!UkO![XO!fuO!iZO!lYO!mYO!nYO!pvO!r!gO!u!hO$V!kO(O!dO(QTO(TUO([VO(j[O(yiO~Oh%VOm%WOo%XOp$tOq$tOw%YOy%ZO{;nO!P${O![$|O!f=OO!i$xO#g;tO$V%_O$r;pO$t;rO$w%`O(O(rO(QTO(TUO([$uO(t$}O(u%PO~O#h(tO~O!X(vO!h(fP~P%[O(`(xO(j[O~O!P(zO!i#xO(`(xO(j[O~OP;POQ;POSfOd<zOe!iOmkOo;POpkOqkOwkOy;PO{;PO!PWO!TkO!UkO![!eO!f;SO!iZO!l;PO!m;PO!n;PO!p;TO!r;WO!u!hO$V!kO(O)XO(QTO(TUO([VO(j[O(y<xO~O!Y$_Oa$oa'u$oa's$oa!h$oa!V$oa![$oa%f$oa!d$oa~O#t)`O~P!&_Oh%VOm%WOo%XOp$tOq$tOw%YOy%ZO{%[O!P${O![$|O!f%aO!i$xO#g%bO$V%_O$r%]O$t%^O$w%`O(O(rO(QTO(TUO([$uO(t$}O(u%PO~Og(kP~P!+hO})eO!d)dO![$]X$Y$]X$[$]X$^$]X$e$]X~O!d)dO![(vX$Y(vX$[(vX$^(vX$e(vX~O})eO~P!-qO})eO![(vX$Y(vX$[(vX$^(vX$e(vX~O![)gO$Y)kO$[)fO$^)fO$e)lO~O!X)oO~P!(oO$[$hO$^$gO$e)sO~Ok$xX}$xX!P$xX#P$xX(t$xX(u$xX~OgjXg$xXkjX!YjX#]jX~P!/gOu)uO(])vO(^)xO~Ok*RO})zO!P){O(t$}O(u%PO~Og)yO~P!0kOg*SO~Oh%VOm%WOo%XOp$tOq$tOw%YOy%ZO{;nO!P*UO![*VO!f=OO!i$xO#g;tO$V%_O$r;pO$t;rO$w%`O(QTO(TUO([$uO(t$}O(u%PO~O!X*YO(O*TO!h(zP~P!1YO#h*[O~O!i*]O~Oh%VOm%WOo%XOp$tOq$tOw%YOy%ZO{;nO!P${O![$|O!f=OO!i$xO#g;tO$V%_O$r;pO$t;rO$w%`O(O*_O(QTO(TUO([$uO(t$}O(u%PO~O!X*bO!V({P~P!3XOo*nO!P*fO!_*lO!`*eO!a*eO!i*]O#X*mO%]*hO(P!lO(`!mO~O!Z*kO~P!4|O#P$dOk(ZX}(ZX!P(ZX(t(ZX(u(ZX!Y(ZX#](ZX~Og(ZX#}(ZX~P!5uOk*sO#]*rOg(YX!Y(YX~O!Y*tOg(XX~O(O&WOg(XP~Op*wO~O!i*|O~O(O(rO~Om+QO!P%fO!X#iO![%gO!y]O#f#lO#g#iO(O%eO!h(nP~O!d#vO#h+RO~O!P%fO!X+TO!Y(YO![%gO(O%eO!V(qP~Op'XO!P+VO!X+UO(QTO(TUO(`(xO~O!Z(sP~P!8uO!Y+WOa)PX'u)PX~OP$[OR#zO[$cOo$aO}#yO!P#{O!i#xO!m$[O#O$RO#k$OO#l$PO#m$PO#n$PO#o$QO#p$RO#q$RO#r$bO#s$RO#u$SO#w$UO#y$WO#z$XO([VO(m$YO(t#|O(u#}O~Oa!ga!Y!ga'u!ga's!ga!V!ga!h!gas!ga![!ga%f!ga!d!ga~P!9mOR#zO}#yO!P#{O!i#xO([VOP!oa[!oao!oa!Y!oa!m!oa#O!oa#k!oa#l!oa#m!oa#n!oa#o!oa#p!oa#q!oa#r!oa#s!oa#u!oa#w!oa#y!oa#z!oa(m!oa(t!oa(u!oa~Oa!oa'u!oa's!oa!V!oa!h!oas!oa![!oa%f!oa!d!oa~P!<TOR#zO}#yO!P#{O!i#xO([VOP!qa[!qao!qa!Y!qa!m!qa#O!qa#k!qa#l!qa#m!qa#n!qa#o!qa#p!qa#q!qa#r!qa#s!qa#u!qa#w!qa#y!qa#z!qa(m!qa(t!qa(u!qa~Oa!qa'u!qa's!qa!V!qa!h!qas!qa![!qa%f!qa!d!qa~P!>kOh%VOk+aO![']O%f+`O~O!d+cOa(WX![(WX'u(WX!Y(WX~Oa%lO![XO'u%lO~Oh%VO!i%cO~Oh%VO!i%cO(O%eO~O!d#vO#h(tO~Ob+nO%g+oO(O+kO(QTO(TUO!Z)TP~O!Y+pO`)SX~O[+tO~O`+uO~O![%}O(O%eO(P!lO`)SP~Oh%VO#]+zO~Oh%VOk+}O![$|O~O![,PO~O},RO![XO~O%k%tO~O!u,WO~Oe,]O~Ob,^O(O#nO(QTO(TUO!Z)RP~Oe%{O~O%g!QO(O&WO~P=RO[,cO`,bO~OPYOQYOSfOdzOeyOmkOoYOpkOqkOwkOyYO{YO!PWO!TkO!UkO!fuO!iZO!lYO!mYO!nYO!pvO!uxO!y]O%e}O(QTO(TUO([VO(j[O(yiO~O![!eO!r!gO$V!kO(O!dO~P!EkO`,bOa%lO'u%lO~OPYOQYOSfOd!jOe!iOmkOoYOpkOqkOwkOyYO{YO!PWO!TkO!UkO![!eO!fuO!iZO!lYO!mYO!nYO!pvO!u!hO$V!kO(O!dO(QTO(TUO([VO(j[O(yiO~Oa,hO!rwO#t!OO%i!OO%j!OO%k!OO~P!HTO!i&lO~O&Y,nO~O![,pO~O&k,rO&m,sOP&haQ&haS&haY&haa&had&hae&ham&hao&hap&haq&haw&hay&ha{&ha!P&ha!T&ha!U&ha![&ha!f&ha!i&ha!l&ha!m&ha!n&ha!p&ha!r&ha!u&ha!y&ha#t&ha$V&ha%e&ha%g&ha%i&ha%j&ha%k&ha%n&ha%p&ha%s&ha%t&ha%v&ha&S&ha&Y&ha&[&ha&^&ha&`&ha&c&ha&i&ha&o&ha&q&ha&s&ha&u&ha&w&ha's&ha(O&ha(Q&ha(T&ha([&ha(j&ha(y&ha!Z&ha&a&hab&ha&f&ha~O(O,xO~Oh!bX!Y!OX!Z!OX!d!OX!d!bX!i!bX#]!OX~O!Y!bX!Z!bX~P# ZO!d,}O#],|Oh(eX!Y#eX!Y(eX!Z#eX!Z(eX!d(eX!i(eX~Oh%VO!d-PO!i%cO!Y!^X!Z!^X~Op!nO!P!oO(QTO(TUO(`!mO~OP;POQ;POSfOd<zOe!iOmkOo;POpkOqkOwkOy;PO{;PO!PWO!TkO!UkO![!eO!f;SO!iZO!l;PO!m;PO!n;PO!p;TO!r;WO!u!hO$V!kO(QTO(TUO([VO(j[O(y<xO~O(O;zO~P##_O!Y-TO!Z(dX~O!Z-VO~O!d,}O#],|O!Y#eX!Z#eX~O!Y-WO!Z(sX~O!Z-YO~O!`-ZO!a-ZO(P!lO~P#!|O!Z-^O~P'_Ok-aO![']O~O!V-fO~Op!xa!_!xa!`!xa!a!xa#Q!xa#R!xa#S!xa#T!xa#U!xa#X!xa#Y!xa(P!xa(Q!xa(T!xa(`!xa(j!xa~P!#ZO!m-kO#]-iO~PCSO!`-mO!a-mO(P!lO~PCrOa%lO#]-iO'u%lO~Oa%lO!d#vO#]-iO'u%lO~Oa%lO!d#vO!m-kO#]-iO'u%lO(m'mO~O'z'uO'{'uO'|-rO~Os-sO~O!V'Sa!Y'Sa~P!9mO!X-wO!V'SX!Y'SX~P%[O!Y(RO!V(ca~O!V(ca~PGfO!Y(YO!V(qa~O!P%fO!X-{O![%gO(O%eO!V'YX!Y'YX~O#]-}O!Y(oa!h(oaa(oa'u(oa~O!d#vO~P#+eO!Y(fO!h(na~O!P%fO![%gO#g.RO(O%eO~Om.WO!P%fO!X.TO![%gO!y]O#f.VO#g.TO(O%eO!Y']X!h']X~OR.[O!i#xO~Oh%VOk._O![']O%f.^O~Oa#`i!Y#`i'u#`i's#`i!V#`i!h#`is#`i![#`i%f#`i!d#`i~P!9mOk=UO})zO!P){O(t$}O(u%PO~O#h#[aa#[a#]#[a'u#[a!Y#[a!h#[a![#[a!V#[a~P#.aO#h(ZXP(ZXR(ZX[(ZXa(ZXo(ZX!i(ZX!m(ZX#O(ZX#k(ZX#l(ZX#m(ZX#n(ZX#o(ZX#p(ZX#q(ZX#r(ZX#s(ZX#u(ZX#w(ZX#y(ZX#z(ZX'u(ZX([(ZX(m(ZX!h(ZX!V(ZX's(ZXs(ZX![(ZX%f(ZX!d(ZX~P!5uO!Y.lO!h(fX~P!9mO!h.oO~O!V.qO~OP$[OR#zO}#yO!P#{O!i#xO!m$[O([VO[#jia#jio#ji!Y#ji#O#ji#l#ji#m#ji#n#ji#o#ji#p#ji#q#ji#r#ji#s#ji#u#ji#w#ji#y#ji#z#ji'u#ji(m#ji(t#ji(u#ji's#ji!V#ji!h#jis#ji![#ji%f#ji!d#ji~O#k#ji~P#1|O#k$OO~P#1|OP$[OR#zOo$aO}#yO!P#{O!i#xO!m$[O#k$OO#l$PO#m$PO#n$PO([VO[#jia#ji!Y#ji#O#ji#p#ji#q#ji#r#ji#s#ji#u#ji#w#ji#y#ji#z#ji'u#ji(m#ji(t#ji(u#ji's#ji!V#ji!h#jis#ji![#ji%f#ji!d#ji~O#o#ji~P#4kO#o$QO~P#4kOP$[OR#zO[$cOo$aO}#yO!P#{O!i#xO!m$[O#O$RO#k$OO#l$PO#m$PO#n$PO#o$QO#p$RO#q$RO#r$bO#s$RO([VOa#ji!Y#ji#w#ji#y#ji#z#ji'u#ji(m#ji(t#ji(u#ji's#ji!V#ji!h#jis#ji![#ji%f#ji!d#ji~O#u#ji~P#7YOP$[OR#zO[$cOo$aO}#yO!P#{O!i#xO!m$[O#O$RO#k$OO#l$PO#m$PO#n$PO#o$QO#p$RO#q$RO#r$bO#s$RO#u$SO([VO(u#}Oa#ji!Y#ji#y#ji#z#ji'u#ji(m#ji(t#ji's#ji!V#ji!h#jis#ji![#ji%f#ji!d#ji~O#w$UO~P#9pO#w#ji~P#9pO#u$SO~P#7YOP$[OR#zO[$cOo$aO}#yO!P#{O!i#xO!m$[O#O$RO#k$OO#l$PO#m$PO#n$PO#o$QO#p$RO#q$RO#r$bO#s$RO#u$SO#w$UO([VO(t#|O(u#}Oa#ji!Y#ji#z#ji'u#ji(m#ji's#ji!V#ji!h#jis#ji![#ji%f#ji!d#ji~O#y#ji~P#<fO#y$WO~P#<fOP]XR]X[]Xo]X}]X!P]X!i]X!m]X#O]X#P]X#]]X#hfX#k]X#l]X#m]X#n]X#o]X#p]X#q]X#r]X#s]X#u]X#w]X#y]X#z]X$P]X([]X(m]X(t]X(u]X!Y]X!Z]X~O#}]X~P#?TOP$[OR#zO[;hOo;fO}#yO!P#{O!i#xO!m$[O#O;]O#k;YO#l;ZO#m;ZO#n;ZO#o;[O#p;]O#q;]O#r;gO#s;]O#u;^O#w;`O#y;bO#z;cO([VO(m$YO(t#|O(u#}O~O#}.sO~P#AbO#P$dO#];iO$P;iO#}(bX!Z(bX~P! YOa'`a!Y'`a'u'`a's'`a!h'`a!V'`as'`a!['`a%f'`a!d'`a~P!9mO[#jia#jio#ji!Y#ji#O#ji#o#ji#p#ji#q#ji#r#ji#s#ji#u#ji#w#ji#y#ji#z#ji'u#ji(m#ji's#ji!V#ji!h#jis#ji![#ji%f#ji!d#ji~OP$[OR#zO}#yO!P#{O!i#xO!m$[O#k$OO#l$PO#m$PO#n$PO([VO(t#ji(u#ji~P#DdOk=UO})zO!P){O(t$}O(u%POP#jiR#ji!i#ji!m#ji#k#ji#l#ji#m#ji#n#ji([#ji~P#DdO!Y.wOg(kX~P!0kOg.yO~Oa$Oi!Y$Oi'u$Oi's$Oi!V$Oi!h$Ois$Oi![$Oi%f$Oi!d$Oi~P!9mO$[.zO$^.zO~O$[.{O$^.{O~O!d)dO#].|O![$bX$Y$bX$[$bX$^$bX$e$bX~O!X.}O~O![)gO$Y/PO$[)fO$^)fO$e/QO~O!Y;dO!Z(aX~P#AbO!Z/RO~O!d)dO$e(vX~O$e/TO~Ou)uO(])vO(^/WO~O!V/[O~P!&_O(t$}Ok%^a}%^a!P%^a(u%^a!Y%^a#]%^a~Og%^a#}%^a~P#K^O(u%POk%`a}%`a!P%`a(t%`a!Y%`a#]%`a~Og%`a#}%`a~P#LPO!YfX!dfX!hfX!h$xX(mfX~P!/gO!X/eO!Y(YO(O/dO!V(qP!V({P~P!1YOo*nO!_*lO!`*eO!a*eO!i*]O#X*mO%]*hO(P!lO~Op'XO!P/fO!X+UO!Z*kO(QTO(TUO(`;wO!Z(sP~P#MjO!h/gO~P#.aO!Y/hO!d#vO(m'mO!h(zX~O!h/mO~O!P%fO!X*YO![%gO(O%eO!h(zP~O#h/oO~O!V$xX!Y$xX!d%PX~P!/gO!Y/pO!V({X~P#.aO!d/rO~O!V/tO~Oh%VOo/xO!d#vO!i%cO(m'mO~O(O/zO~O!d+cO~Oa%lO!Y0OO'u%lO~O!Z0QO~P!4|O!`0RO!a0RO(P!lO(`!mO~O!P0TO(`!mO~O#X0UO~Og%^a!Y%^a#]%^a#}%^a~P!0kOg%`a!Y%`a#]%`a#}%`a~P!0kO(O&WOg'iX!Y'iX~O!Y*tOg(Xa~Og0_O~OR0`O}0`O!P0aO#P$dOkza(tza(uza!Yza#]za~Ogza#}za~P$%]O})zO!P){Ok$qa(t$qa(u$qa!Y$qa#]$qa~Og$qa#}$qa~P$&UO})zO!P){Ok$sa(t$sa(u$sa!Y$sa#]$sa~Og$sa#}$sa~P$&wO#h0dO~Og%Ra!Y%Ra#]%Ra#}%Ra~P!0kO!d#vO~O#h0gO~O!Y+WOa)Pa'u)Pa~OR#zO}#yO!P#{O!i#xO([VOP!oi[!oio!oi!Y!oi!m!oi#O!oi#k!oi#l!oi#m!oi#n!oi#o!oi#p!oi#q!oi#r!oi#s!oi#u!oi#w!oi#y!oi#z!oi(m!oi(t!oi(u!oi~Oa!oi'u!oi's!oi!V!oi!h!ois!oi![!oi%f!oi!d!oi~P$(fOh%VOo%XOp$tOq$tOw%YOy%ZO{;nO!P${O![$|O!f=OO!i$xO#g;tO$V%_O$r;pO$t;rO$w%`O(QTO(TUO([$uO(t$}O(u%PO~Om0pO(O0oO~P$*|O!d+cOa(Wa![(Wa'u(Wa!Y(Wa~O#h0vO~O[]X!YfX!ZfX~O!Y0wO!Z)TX~O!Z0yO~O[0zO~Ob0|O(O+kO(QTO(TUO~O![%}O(O%eO`'qX!Y'qX~O!Y+pO`)Sa~O!h1PO~P!9mO[1SO~O`1TO~O#]1WO~Ok1ZO![$|O~O(`(xO!Z)QP~Oh%VOk1dO![1aO%f1cO~O[1nO!Y1lO!Z)RX~O!Z1oO~O`1qOa%lO'u%lO~O(O#nO(QTO(TUO~O#P$dO#]$eO$P$eOP(bXR(bX[(bXo(bX}(bX!P(bX!Y(bX!i(bX!m(bX#O(bX#k(bX#l(bX#m(bX#n(bX#o(bX#p(bX#q(bX#r(bX#u(bX#w(bX#y(bX#z(bX([(bX(m(bX(t(bX(u(bX~O#s1tO&W1uOa(bX~P$0dO#]$eO#s1tO&W1uO~Oa1wO~P%[Oa1yO~O&a1|OP&_iQ&_iS&_iY&_ia&_id&_ie&_im&_io&_ip&_iq&_iw&_iy&_i{&_i!P&_i!T&_i!U&_i![&_i!f&_i!i&_i!l&_i!m&_i!n&_i!p&_i!r&_i!u&_i!y&_i#t&_i$V&_i%e&_i%g&_i%i&_i%j&_i%k&_i%n&_i%p&_i%s&_i%t&_i%v&_i&S&_i&Y&_i&[&_i&^&_i&`&_i&c&_i&i&_i&o&_i&q&_i&s&_i&u&_i&w&_i's&_i(O&_i(Q&_i(T&_i([&_i(j&_i(y&_i!Z&_ib&_i&f&_i~Ob2SO!Z2QO&f2RO~P`O![XO!i2UO~O&m,sOP&hiQ&hiS&hiY&hia&hid&hie&him&hio&hip&hiq&hiw&hiy&hi{&hi!P&hi!T&hi!U&hi![&hi!f&hi!i&hi!l&hi!m&hi!n&hi!p&hi!r&hi!u&hi!y&hi#t&hi$V&hi%e&hi%g&hi%i&hi%j&hi%k&hi%n&hi%p&hi%s&hi%t&hi%v&hi&S&hi&Y&hi&[&hi&^&hi&`&hi&c&hi&i&hi&o&hi&q&hi&s&hi&u&hi&w&hi's&hi(O&hi(Q&hi(T&hi([&hi(j&hi(y&hi!Z&hi&a&hib&hi&f&hi~O!V2[O~O!Y!^a!Z!^a~P#AbOp!nO!P!oO!X2bO(`!mO!Y'TX!Z'TX~P@YO!Y-TO!Z(da~O!Y'ZX!Z'ZX~P!8uO!Y-WO!Z(sa~O!Z2iO~P'_Oa%lO#]2rO'u%lO~Oa%lO!d#vO#]2rO'u%lO~Oa%lO!d#vO!m2vO#]2rO'u%lO(m'mO~Oa%lO'u%lO~P!9mO!Y$_Os$oa~O!V'Si!Y'Si~P!9mO!Y(RO!V(ci~O!Y(YO!V(qi~O!V(ri!Y(ri~P!9mO!Y(oi!h(oia(oi'u(oi~P!9mO#]2xO!Y(oi!h(oia(oi'u(oi~O!Y(fO!h(ni~O!P%fO![%gO!y]O#f2}O#g2|O(O%eO~O!P%fO![%gO#g2|O(O%eO~Ok3UO![']O%f3TO~Oh%VOk3UO![']O%f3TO~O#h%^aP%^aR%^a[%^aa%^ao%^a!i%^a!m%^a#O%^a#k%^a#l%^a#m%^a#n%^a#o%^a#p%^a#q%^a#r%^a#s%^a#u%^a#w%^a#y%^a#z%^a'u%^a([%^a(m%^a!h%^a!V%^a's%^as%^a![%^a%f%^a!d%^a~P#K^O#h%`aP%`aR%`a[%`aa%`ao%`a!i%`a!m%`a#O%`a#k%`a#l%`a#m%`a#n%`a#o%`a#p%`a#q%`a#r%`a#s%`a#u%`a#w%`a#y%`a#z%`a'u%`a([%`a(m%`a!h%`a!V%`a's%`as%`a![%`a%f%`a!d%`a~P#LPO#h%^aP%^aR%^a[%^aa%^ao%^a!Y%^a!i%^a!m%^a#O%^a#k%^a#l%^a#m%^a#n%^a#o%^a#p%^a#q%^a#r%^a#s%^a#u%^a#w%^a#y%^a#z%^a'u%^a([%^a(m%^a!h%^a!V%^a's%^a#]%^as%^a![%^a%f%^a!d%^a~P#.aO#h%`aP%`aR%`a[%`aa%`ao%`a!Y%`a!i%`a!m%`a#O%`a#k%`a#l%`a#m%`a#n%`a#o%`a#p%`a#q%`a#r%`a#s%`a#u%`a#w%`a#y%`a#z%`a'u%`a([%`a(m%`a!h%`a!V%`a's%`a#]%`as%`a![%`a%f%`a!d%`a~P#.aO#hzaPza[zaazaoza!iza!mza#Oza#kza#lza#mza#nza#oza#pza#qza#rza#sza#uza#wza#yza#zza'uza([za(mza!hza!Vza'szasza![za%fza!dza~P$%]O#h$qaP$qaR$qa[$qaa$qao$qa!i$qa!m$qa#O$qa#k$qa#l$qa#m$qa#n$qa#o$qa#p$qa#q$qa#r$qa#s$qa#u$qa#w$qa#y$qa#z$qa'u$qa([$qa(m$qa!h$qa!V$qa's$qas$qa![$qa%f$qa!d$qa~P$&UO#h$saP$saR$sa[$saa$sao$sa!i$sa!m$sa#O$sa#k$sa#l$sa#m$sa#n$sa#o$sa#p$sa#q$sa#r$sa#s$sa#u$sa#w$sa#y$sa#z$sa'u$sa([$sa(m$sa!h$sa!V$sa's$sas$sa![$sa%f$sa!d$sa~P$&wO#h%RaP%RaR%Ra[%Raa%Rao%Ra!Y%Ra!i%Ra!m%Ra#O%Ra#k%Ra#l%Ra#m%Ra#n%Ra#o%Ra#p%Ra#q%Ra#r%Ra#s%Ra#u%Ra#w%Ra#y%Ra#z%Ra'u%Ra([%Ra(m%Ra!h%Ra!V%Ra's%Ra#]%Ras%Ra![%Ra%f%Ra!d%Ra~P#.aOa#`q!Y#`q'u#`q's#`q!V#`q!h#`qs#`q![#`q%f#`q!d#`q~P!9mO!X3^O!Y'UX!h'UX~P%[O!Y.lO!h(fa~O!Y.lO!h(fa~P!9mO!V3aO~O#}!ka!Z!ka~PKPO#}!ga!Y!ga!Z!ga~P#AbO#}!oa!Z!oa~P!<TO#}!qa!Z!qa~P!>kOg'XX!Y'XX~P!+hO!Y.wOg(ka~OSfO![3uO$c3vO~O!Z3zO~Os3{O~P#.aOa$lq!Y$lq'u$lq's$lq!V$lq!h$lqs$lq![$lq%f$lq!d$lq~P!9mO!V3|O~P#.aO})zO!P){O(u%POk'ea(t'ea!Y'ea#]'ea~Og'ea#}'ea~P%)nO})zO!P){Ok'ga(t'ga(u'ga!Y'ga#]'ga~Og'ga#}'ga~P%*aO(m$YO~P#.aO!VfX!V$xX!YfX!Y$xX!d%PX#]fX~P!/gO(O<QO~P!1YOmkO(O4OO~P.iO!P%fO!X4QO![%gO(O%eO!Y'aX!h'aX~O!Y/hO!h(za~O!Y/hO!d#vO!h(za~O!Y/hO!d#vO(m'mO!h(za~Og$zi!Y$zi#]$zi#}$zi~P!0kO!X4YO!V'cX!Y'cX~P!3XO!Y/pO!V({a~O!Y/pO!V({a~P#.aO!d#vO#s4bO~Oo4eO!d#vO(m'mO~O!P4hO(`!mO~O(t$}Ok%^i}%^i!P%^i(u%^i!Y%^i#]%^i~Og%^i#}%^i~P%.wO(u%POk%`i}%`i!P%`i(t%`i!Y%`i#]%`i~Og%`i#}%`i~P%/jOg(Yi!Y(Yi~P!0kO#]4mOg(Yi!Y(Yi~P!0kO!h4pO~Oa$mq!Y$mq'u$mq's$mq!V$mq!h$mqs$mq![$mq%f$mq!d$mq~P!9mO!V4tO~O!Y4uO![(|X~P#.aOa$xX![$xX%Z]X'u$xX!Y$xX~P!/gO%Z4xOalXklX}lX!PlX![lX'ulX(tlX(ulX!YlX~O%Z4xO~Ob5OO%g5PO(O+kO(QTO(TUO!Y'pX!Z'pX~O!Y0wO!Z)Ta~O[5TO~O`5UO~Oa%lO'u%lO~P#.aO![$|O~P#.aO!Y5^O#]5`O!Z)QX~O!Z5aO~Oo5hOp!nO!P5bO!_!yO!`!vO!a!vO!y;QO#Q!pO#R!pO#S!pO#T!pO#U!pO#X5gO#Y!zO(P!lO(QTO(TUO(`!mO(j!sO~O!Z5fO~P%4tOk5mO![1aO%f5lO~Oh%VOk5mO![1aO%f5lO~Ob5tO(O#nO(QTO(TUO!Y'oX!Z'oX~O!Y1lO!Z)Ra~O(QTO(TUO(`5vO~O`5zO~O#s5}O&W6OO~PMlO!h6PO~P%[Oa6RO~Oa6RO~P%[Ob2SO!Z6WO&f2RO~P`O!d6YO~O!d6[Oh(ei!Y(ei!Z(ei!d(ei!i(ei~O!Y#ei!Z#ei~P#AbO#]6]O!Y#ei!Z#ei~O!Y!^i!Z!^i~P#AbOa%lO#]6fO'u%lO~Oa%lO!d#vO#]6fO'u%lO~O!Y(oq!h(oqa(oq'u(oq~P!9mO!Y(fO!h(nq~O!P%fO![%gO#g6mO(O%eO~O![']O%f6pO~Ok6tO![']O%f6pO~O#h'eaP'eaR'ea['eaa'eao'ea!i'ea!m'ea#O'ea#k'ea#l'ea#m'ea#n'ea#o'ea#p'ea#q'ea#r'ea#s'ea#u'ea#w'ea#y'ea#z'ea'u'ea(['ea(m'ea!h'ea!V'ea's'eas'ea!['ea%f'ea!d'ea~P%)nO#h'gaP'gaR'ga['gaa'gao'ga!i'ga!m'ga#O'ga#k'ga#l'ga#m'ga#n'ga#o'ga#p'ga#q'ga#r'ga#s'ga#u'ga#w'ga#y'ga#z'ga'u'ga(['ga(m'ga!h'ga!V'ga's'gas'ga!['ga%f'ga!d'ga~P%*aO#h$ziP$ziR$zi[$zia$zio$zi!Y$zi!i$zi!m$zi#O$zi#k$zi#l$zi#m$zi#n$zi#o$zi#p$zi#q$zi#r$zi#s$zi#u$zi#w$zi#y$zi#z$zi'u$zi([$zi(m$zi!h$zi!V$zi's$zi#]$zis$zi![$zi%f$zi!d$zi~P#.aO#h%^iP%^iR%^i[%^ia%^io%^i!i%^i!m%^i#O%^i#k%^i#l%^i#m%^i#n%^i#o%^i#p%^i#q%^i#r%^i#s%^i#u%^i#w%^i#y%^i#z%^i'u%^i([%^i(m%^i!h%^i!V%^i's%^is%^i![%^i%f%^i!d%^i~P%.wO#h%`iP%`iR%`i[%`ia%`io%`i!i%`i!m%`i#O%`i#k%`i#l%`i#m%`i#n%`i#o%`i#p%`i#q%`i#r%`i#s%`i#u%`i#w%`i#y%`i#z%`i'u%`i([%`i(m%`i!h%`i!V%`i's%`is%`i![%`i%f%`i!d%`i~P%/jO!Y'Ua!h'Ua~P!9mO!Y.lO!h(fi~O#}#`i!Y#`i!Z#`i~P#AbOP$[OR#zO}#yO!P#{O!i#xO!m$[O([VO[#jio#ji#O#ji#l#ji#m#ji#n#ji#o#ji#p#ji#q#ji#r#ji#s#ji#u#ji#w#ji#y#ji#z#ji#}#ji(m#ji(t#ji(u#ji!Y#ji!Z#ji~O#k#ji~P%G^O#k;YO~P%G^OP$[OR#zOo;fO}#yO!P#{O!i#xO!m$[O#k;YO#l;ZO#m;ZO#n;ZO([VO[#ji#O#ji#p#ji#q#ji#r#ji#s#ji#u#ji#w#ji#y#ji#z#ji#}#ji(m#ji(t#ji(u#ji!Y#ji!Z#ji~O#o#ji~P%IfO#o;[O~P%IfOP$[OR#zO[;hOo;fO}#yO!P#{O!i#xO!m$[O#O;]O#k;YO#l;ZO#m;ZO#n;ZO#o;[O#p;]O#q;]O#r;gO#s;]O([VO#w#ji#y#ji#z#ji#}#ji(m#ji(t#ji(u#ji!Y#ji!Z#ji~O#u#ji~P%KnOP$[OR#zO[;hOo;fO}#yO!P#{O!i#xO!m$[O#O;]O#k;YO#l;ZO#m;ZO#n;ZO#o;[O#p;]O#q;]O#r;gO#s;]O#u;^O([VO(u#}O#y#ji#z#ji#}#ji(m#ji(t#ji!Y#ji!Z#ji~O#w;`O~P%MoO#w#ji~P%MoO#u;^O~P%KnOP$[OR#zO[;hOo;fO}#yO!P#{O!i#xO!m$[O#O;]O#k;YO#l;ZO#m;ZO#n;ZO#o;[O#p;]O#q;]O#r;gO#s;]O#u;^O#w;`O([VO(t#|O(u#}O#z#ji#}#ji(m#ji!Y#ji!Z#ji~O#y#ji~P&!OO#y;bO~P&!OOa#{y!Y#{y'u#{y's#{y!V#{y!h#{ys#{y![#{y%f#{y!d#{y~P!9mO[#jio#ji#O#ji#o#ji#p#ji#q#ji#r#ji#s#ji#u#ji#w#ji#y#ji#z#ji#}#ji(m#ji!Y#ji!Z#ji~OP$[OR#zO}#yO!P#{O!i#xO!m$[O#k;YO#l;ZO#m;ZO#n;ZO([VO(t#ji(u#ji~P&$zOk=VO})zO!P){O(t$}O(u%POP#jiR#ji!i#ji!m#ji#k#ji#l#ji#m#ji#n#ji([#ji~P&$zO#P$dOP(ZXR(ZX[(ZXk(ZXo(ZX}(ZX!P(ZX!i(ZX!m(ZX#O(ZX#k(ZX#l(ZX#m(ZX#n(ZX#o(ZX#p(ZX#q(ZX#r(ZX#s(ZX#u(ZX#w(ZX#y(ZX#z(ZX#}(ZX([(ZX(m(ZX(t(ZX(u(ZX!Y(ZX!Z(ZX~O#}$Oi!Y$Oi!Z$Oi~P#AbO#}!oi!Z!oi~P$(fOg'Xa!Y'Xa~P!0kO!Z7WO~O!Y'`a!Z'`a~P#AbOP]XR]X[]Xo]X}]X!P]X!V]X!Y]X!i]X!m]X#O]X#P]X#]]X#hfX#k]X#l]X#m]X#n]X#o]X#p]X#q]X#r]X#s]X#u]X#w]X#y]X#z]X$P]X([]X(m]X(t]X(u]X~O!d%WX#s%WX~P&+QO!d#vO(m'mO!Y'aa!h'aa~O!Y/hO!h(zi~O!Y/hO!d#vO!h(zi~Og$zq!Y$zq#]$zq#}$zq~P!0kO!V'ca!Y'ca~P#.aO!d7_O~O!Y/pO!V({i~P#.aO!Y/pO!V({i~O!V7cO~O!d#vO#s7hO~Oo7iO!d#vO(m'mO~O})zO!P){O(u%POk'fa(t'fa!Y'fa#]'fa~Og'fa#}'fa~P&/pO})zO!P){Ok'ha(t'ha(u'ha!Y'ha#]'ha~Og'ha#}'ha~P&0cO!V7lO~Og$|q!Y$|q#]$|q#}$|q~P!0kOa$my!Y$my'u$my's$my!V$my!h$mys$my![$my%f$my!d$my~P!9mO!d6[O~O!Y4uO![(|a~O![']OP$SaR$Sa[$Sao$Sa}$Sa!P$Sa!Y$Sa!i$Sa!m$Sa#O$Sa#k$Sa#l$Sa#m$Sa#n$Sa#o$Sa#p$Sa#q$Sa#r$Sa#s$Sa#u$Sa#w$Sa#y$Sa#z$Sa([$Sa(m$Sa(t$Sa(u$Sa~O%f6pO~P&2lOa#`y!Y#`y'u#`y's#`y!V#`y!h#`ys#`y![#`y%f#`y!d#`y~P!9mO[7qO~Ob7sO(O+kO(QTO(TUO~O!Y0wO!Z)Ti~O`7wO~O(`(xO!Y'lX!Z'lX~O!Y5^O!Z)Qa~O!Z8QO~P%4tOp!nO!P8RO(QTO(TUO(`!mO(j!sO~O#X8SO~O![1aO~O![1aO%f8UO~Ok8XO![1aO%f8UO~O[8^O!Y'oa!Z'oa~O!Y1lO!Z)Ri~O!h8bO~O!h8cO~O!h8fO~O!h8fO~P%[Oa8hO~O!d8iO~O!h8jO~O!Y(ri!Z(ri~P#AbOa%lO#]8rO'u%lO~O!Y(oy!h(oya(oy'u(oy~P!9mO!Y(fO!h(ny~O%f8uO~P&2lO![']O%f8uO~O#h$zqP$zqR$zq[$zqa$zqo$zq!Y$zq!i$zq!m$zq#O$zq#k$zq#l$zq#m$zq#n$zq#o$zq#p$zq#q$zq#r$zq#s$zq#u$zq#w$zq#y$zq#z$zq'u$zq([$zq(m$zq!h$zq!V$zq's$zq#]$zqs$zq![$zq%f$zq!d$zq~P#.aO#h'faP'faR'fa['faa'fao'fa!i'fa!m'fa#O'fa#k'fa#l'fa#m'fa#n'fa#o'fa#p'fa#q'fa#r'fa#s'fa#u'fa#w'fa#y'fa#z'fa'u'fa(['fa(m'fa!h'fa!V'fa's'fas'fa!['fa%f'fa!d'fa~P&/pO#h'haP'haR'ha['haa'hao'ha!i'ha!m'ha#O'ha#k'ha#l'ha#m'ha#n'ha#o'ha#p'ha#q'ha#r'ha#s'ha#u'ha#w'ha#y'ha#z'ha'u'ha(['ha(m'ha!h'ha!V'ha's'has'ha!['ha%f'ha!d'ha~P&0cO#h$|qP$|qR$|q[$|qa$|qo$|q!Y$|q!i$|q!m$|q#O$|q#k$|q#l$|q#m$|q#n$|q#o$|q#p$|q#q$|q#r$|q#s$|q#u$|q#w$|q#y$|q#z$|q'u$|q([$|q(m$|q!h$|q!V$|q's$|q#]$|qs$|q![$|q%f$|q!d$|q~P#.aO!Y'Ui!h'Ui~P!9mO#}#`q!Y#`q!Z#`q~P#AbO(t$}OP%^aR%^a[%^ao%^a!i%^a!m%^a#O%^a#k%^a#l%^a#m%^a#n%^a#o%^a#p%^a#q%^a#r%^a#s%^a#u%^a#w%^a#y%^a#z%^a#}%^a([%^a(m%^a!Y%^a!Z%^a~Ok%^a}%^a!P%^a(u%^a~P&CoO(u%POP%`aR%`a[%`ao%`a!i%`a!m%`a#O%`a#k%`a#l%`a#m%`a#n%`a#o%`a#p%`a#q%`a#r%`a#s%`a#u%`a#w%`a#y%`a#z%`a#}%`a([%`a(m%`a!Y%`a!Z%`a~Ok%`a}%`a!P%`a(t%`a~P&EsOk=VO})zO!P){O(u%PO~P&CoOk=VO})zO!P){O(t$}O~P&EsOR0`O}0`O!P0aO#P$dOPza[zakzaoza!iza!mza#Oza#kza#lza#mza#nza#oza#pza#qza#rza#sza#uza#wza#yza#zza#}za([za(mza(tza(uza!Yza!Zza~O})zO!P){OP$qaR$qa[$qak$qao$qa!i$qa!m$qa#O$qa#k$qa#l$qa#m$qa#n$qa#o$qa#p$qa#q$qa#r$qa#s$qa#u$qa#w$qa#y$qa#z$qa#}$qa([$qa(m$qa(t$qa(u$qa!Y$qa!Z$qa~O})zO!P){OP$saR$sa[$sak$sao$sa!i$sa!m$sa#O$sa#k$sa#l$sa#m$sa#n$sa#o$sa#p$sa#q$sa#r$sa#s$sa#u$sa#w$sa#y$sa#z$sa#}$sa([$sa(m$sa(t$sa(u$sa!Y$sa!Z$sa~Ok=VO})zO!P){O(t$}O(u%PO~OP%RaR%Ra[%Rao%Ra!i%Ra!m%Ra#O%Ra#k%Ra#l%Ra#m%Ra#n%Ra#o%Ra#p%Ra#q%Ra#r%Ra#s%Ra#u%Ra#w%Ra#y%Ra#z%Ra#}%Ra([%Ra(m%Ra!Y%Ra!Z%Ra~P&NlO#}$lq!Y$lq!Z$lq~P#AbO#}$mq!Y$mq!Z$mq~P#AbO!Z9SO~O#}9TO~P!0kO!d#vO!Y'ai!h'ai~O!d#vO(m'mO!Y'ai!h'ai~O!Y/hO!h(zq~O!V'ci!Y'ci~P#.aO!Y/pO!V({q~Oo9[O!d#vO(m'mO~O!V9]O~P#.aO!V9]O~O!d#vO#s9bO~Og(Yy!Y(Yy~P!0kO!Y'ja!['ja~P#.aOa%Yq![%Yq'u%Yq!Y%Yq~P#.aO[9dO~O!Y0wO!Z)Tq~O#]9hO!Y'la!Z'la~O!Y5^O!Z)Qi~P#AbO!P4hO~O![1aO%f9lO~O(QTO(TUO(`9qO~O!Y1lO!Z)Rq~O!h9tO~O!h9uO~O!h9vO~O!h9vO~P%[O#]9yO!Y#ey!Z#ey~O!Y#ey!Z#ey~P#AbO%f:OO~P&2lO![']O%f:OO~O#}#{y!Y#{y!Z#{y~P#AbOP$ziR$zi[$zio$zi!i$zi!m$zi#O$zi#k$zi#l$zi#m$zi#n$zi#o$zi#p$zi#q$zi#r$zi#s$zi#u$zi#w$zi#y$zi#z$zi#}$zi([$zi(m$zi!Y$zi!Z$zi~P&NlO})zO!P){O(u%POP'eaR'ea['eak'eao'ea!i'ea!m'ea#O'ea#k'ea#l'ea#m'ea#n'ea#o'ea#p'ea#q'ea#r'ea#s'ea#u'ea#w'ea#y'ea#z'ea#}'ea(['ea(m'ea(t'ea!Y'ea!Z'ea~O})zO!P){OP'gaR'ga['gak'gao'ga!i'ga!m'ga#O'ga#k'ga#l'ga#m'ga#n'ga#o'ga#p'ga#q'ga#r'ga#s'ga#u'ga#w'ga#y'ga#z'ga#}'ga(['ga(m'ga(t'ga(u'ga!Y'ga!Z'ga~O(t$}OP%^iR%^i[%^ik%^io%^i}%^i!P%^i!i%^i!m%^i#O%^i#k%^i#l%^i#m%^i#n%^i#o%^i#p%^i#q%^i#r%^i#s%^i#u%^i#w%^i#y%^i#z%^i#}%^i([%^i(m%^i(u%^i!Y%^i!Z%^i~O(u%POP%`iR%`i[%`ik%`io%`i}%`i!P%`i!i%`i!m%`i#O%`i#k%`i#l%`i#m%`i#n%`i#o%`i#p%`i#q%`i#r%`i#s%`i#u%`i#w%`i#y%`i#z%`i#}%`i([%`i(m%`i(t%`i!Y%`i!Z%`i~O#}$my!Y$my!Z$my~P#AbO#}#`y!Y#`y!Z#`y~P#AbO!d#vO!Y'aq!h'aq~O!Y/hO!h(zy~O!V'cq!Y'cq~P#.aOo:YO!d#vO(m'mO~O!V:ZO~P#.aO!V:ZO~O!Y0wO!Z)Ty~O!Y5^O!Z)Qq~O![1aO%f:cO~O!h:fO~O%f:kO~P&2lOP$zqR$zq[$zqo$zq!i$zq!m$zq#O$zq#k$zq#l$zq#m$zq#n$zq#o$zq#p$zq#q$zq#r$zq#s$zq#u$zq#w$zq#y$zq#z$zq#}$zq([$zq(m$zq!Y$zq!Z$zq~P&NlO})zO!P){O(u%POP'faR'fa['fak'fao'fa!i'fa!m'fa#O'fa#k'fa#l'fa#m'fa#n'fa#o'fa#p'fa#q'fa#r'fa#s'fa#u'fa#w'fa#y'fa#z'fa#}'fa(['fa(m'fa(t'fa!Y'fa!Z'fa~O})zO!P){OP'haR'ha['hak'hao'ha!i'ha!m'ha#O'ha#k'ha#l'ha#m'ha#n'ha#o'ha#p'ha#q'ha#r'ha#s'ha#u'ha#w'ha#y'ha#z'ha#}'ha(['ha(m'ha(t'ha(u'ha!Y'ha!Z'ha~OP$|qR$|q[$|qo$|q!i$|q!m$|q#O$|q#k$|q#l$|q#m$|q#n$|q#o$|q#p$|q#q$|q#r$|q#s$|q#u$|q#w$|q#y$|q#z$|q#}$|q([$|q(m$|q!Y$|q!Z$|q~P&NlOg%b!Z!Y%b!Z#]%b!Z#}%b!Z~P!0kOo:oO!d#vO(m'mO~O!V:pO~P#.aO!Y'lq!Z'lq~P#AbO!Y#e!Z!Z#e!Z~P#AbO#h%b!ZP%b!ZR%b!Z[%b!Za%b!Zo%b!Z!Y%b!Z!i%b!Z!m%b!Z#O%b!Z#k%b!Z#l%b!Z#m%b!Z#n%b!Z#o%b!Z#p%b!Z#q%b!Z#r%b!Z#s%b!Z#u%b!Z#w%b!Z#y%b!Z#z%b!Z'u%b!Z([%b!Z(m%b!Z!h%b!Z!V%b!Z's%b!Z#]%b!Zs%b!Z![%b!Z%f%b!Z!d%b!Z~P#.aOo:xO!d#vO(m'mO~OP%b!ZR%b!Z[%b!Zo%b!Z!i%b!Z!m%b!Z#O%b!Z#k%b!Z#l%b!Z#m%b!Z#n%b!Z#o%b!Z#p%b!Z#q%b!Z#r%b!Z#s%b!Z#u%b!Z#w%b!Z#y%b!Z#z%b!Z#}%b!Z([%b!Z(m%b!Z!Y%b!Z!Z%b!Z~P&NlOs(aX~P1qO}%pO~P!(oO(P!lO~P!(oO!VfX!YfX#]fX~P&+QOP]XR]X[]Xo]X}]X!P]X!Y]X!YfX!i]X!m]X#O]X#P]X#]]X#]fX#hfX#k]X#l]X#m]X#n]X#o]X#p]X#q]X#r]X#s]X#u]X#w]X#y]X#z]X$P]X([]X(m]X(t]X(u]X~O!dfX!h]X!hfX(mfX~P'BxOP;POQ;POSfOd<zOe!iOmkOo;POpkOqkOwkOy;PO{;PO!PWO!TkO!UkO![XO!f;SO!iZO!l;PO!m;PO!n;PO!p;TO!r;WO!u!hO$V!kO(O)XO(QTO(TUO([VO(j[O(y<xO~O!Y;dO!Z$oa~Oh%VOm%WOo%XOp$tOq$tOw%YOy%ZO{;oO!P${O![$|O!f=PO!i$xO#g;uO$V%_O$r;qO$t;sO$w%`O(O(rO(QTO(TUO([$uO(t$}O(u%PO~O#t)`O~P'GnOo!bX(m!bX~P# ZO!Z]X!ZfX~P'BxO!VfX!V$xX!YfX!Y$xX#]fX~P!/gO#h;XO~O!d#vO#h;XO~O#];iO~O#s;]O~O#];xO!Y(rX!Z(rX~O#];iO!Y(pX!Z(pX~O#h;yO~Og;{O~P!0kO#h<RO~O#h<SO~O!d#vO#h<TO~O!d#vO#h;yO~O#}<UO~P#AbO#h<VO~O#h<WO~O#h<]O~O#h<^O~O#h<_O~O#h<`O~O#}<aO~P!0kO#}<bO~P!0kO#P#Q#R#T#U#X#f#g#r(y$r$t$w%Z%e%f%g%n%p%s%t%v%x~'yT#l!U'w(P#mp#k#no}'x$['x(O$^(`~",
  goto: "$4Q)XPPPPPP)YPP)]P)nP+O/PPPPP5xPP6`PP<V?mP@QP@QPPP@QPBRP@QP@QP@QPBVPB[PByPGrPPPGvPPPPGvJxPPPKOKzPGvPGvPPNYGvPPPGvPGvP!!aGvP!%v!&{!'UP!'x!'|!'x!+YPPPPPPP!+y!&{PP!,Z!-gP!0jGvGv!0o!3z!8b!8b!<`PPP!<hGvPPPPPPPPPPP!?vP!ATPPGv!BfPGvPGvGvGvGvGvPGv!CxP!GRP!JWP!J[!Jf!Jj!JjP!GOP!Jn!JnP!MsP!MwGvGv!M}##RBV@QP@QP@Q@QP#$_@Q@Q#&j@Q#)Z@Q#+`@Q@Q#,O#.]#.]#.b#.k#.]#.wP#.]P@Q#/a@Q#3S@Q@Q5xPPP#6{PPP#7f#7fP#7fP#7|#7fPP#8SP#7yP#7y#8g#7y#9R#9X5u)]#9[)]P#9c#9c#9cP)]P)]P)]P)]PP)]P#9i#9lP#9l)]P#9pP#9sP)]P)]P)]P)]P)]P)])]PP#9y#:P#:[#:b#:h#:n#:t#;S#;Y#;d#;j#;t#;z#<[#<b#=S#=f#=l#=r#>Q#>g#@V#@e#@l#BR#Ba#C|#D[#Db#Dh#Dn#Dx#EO#EU#E`#Er#ExPPPPPPPPPP#FOPPPPPPP#Fs#Iz#KZ#Kb#KjPPP$!sP$!|$%t$,^$,a$,d$-P$-S$-Z$-cP$-i$-lP$.Y$.^$/U$0d$0i$1PPP$1U$1[$1`P$1c$1g$1k$2a$2x$3a$3e$3h$3k$3q$3t$3x$3|R!|RoqOXst!Z#d%k&o&q&r&t,k,p1|2PY!vQ']-]1a5eQ%rvQ%zyQ&R|Q&g!VS'T!e-TQ'c!iS'i!r!yU*e$|*V*jQ+i%{Q+v&TQ,[&aQ-Z'[Q-e'dQ-m'jQ0R*lQ1k,]R;v;T%QdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%k%r&P&h&k&o&q&r&t&x'Q'_'o(P(R(X(`(t(v(z)y+R+V,h,k,p-a-i-w-}.l.s/f0a0g0v1d1t1u1w1y1|2P2R2r2x3^5b5m5}6O6R6f8R8X8h8rS#q];Q!r)Z$Z$n'U)o,|-P.}2b3u5`6]9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{U*y%[;n;oQ+n%}Q,^&dQ,e&lQ0m+aQ0q+cQ0|+oQ1s,cQ3Q._Q5O0wQ5t1lQ6r3UQ7s5PR8x6t'OkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%k%r&P&h&k&l&o&q&r&t&x'Q'U'_'o(P(R(X(`(t(v(z)o)y+R+V+a,h,k,p,|-P-a-i-w-}._.l.s.}/f0a0g0v1d1t1u1w1y1|2P2R2b2r2x3U3^3u5`5b5m5}6O6R6]6f6t8R8X8h8r9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{t!nQ!r!v!y!z'T'[']'i'j'k-T-Z-]-m1a5e5g$|$ti#v$b$c$d$x${%O%Q%]%^%b)u){)}*P*R*U*[*b*r*s+`+c+z+}.^.w/]/e/o/p/r0V0X0d1W1Z1c3T3}4Y4b4m4u4x5l6p7_7h8U8u9T9b9l:O:c:k;g;h;j;k;l;m;p;q;r;s;t;u;|;}<O<P<R<S<V<W<X<Y<Z<[<]<^<a<b<x=Q=R=U=VQ&U|Q'R!eU'X%g*V-WQ+n%}Q,^&dQ0c*|Q0|+oQ1R+uQ1r,bQ1s,cQ5O0wQ5X1TQ5t1lQ5w1nQ5x1qQ7s5PQ7v5UQ8a5zQ9g7wR9r8^rnOXst!V!Z#d%k&f&o&q&r&t,k,p1|2PR,`&h&x^OPXYstuvwz!Z!`!g!j!o#S#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%k%r&P&h&k&l&o&q&r&t&x'Q'_'o(R(X(`(t(v(z)o)y+R+V+a,h,k,p,|-P-a-i-w-}._.l.s.}/f0a0g0v1d1t1u1w1y1|2P2R2b2r2x3U3^3u5`5b5m5}6O6R6]6f6t8R8X8h8r9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<z<{[#]WZ#W#Z'U(P!b%hm#h#i#l$x%c%f(Y(d(e(f*U*Y*]+T+U+W,g,}-{.R.S.T.V/e/h2U2|2}4Q6[6mQ%uxQ%yyS&O|&TQ&[!TQ'`!hQ'b!iQ(m#sS+h%z%{Q+l%}Q,V&_Q,Z&aS-d'c'dQ.a(nQ0u+iQ0{+oQ0}+pQ1Q+tQ1f,WS1j,[,]Q2n-eQ4}0wQ5R0zQ5W1SQ5s1kQ7r5PQ7u5TQ9c7qR:^9d!O$zi$d%O%Q%]%^%b)}*P*[*r*s.w/o0V0X0d3}4m9T<x=Q=R!S%wy!i!u%y%z%{'S'b'c'd'h'r*d+h+i-Q-d-e-l/y0u2g2n2u4dQ+b%uQ+{&XQ,O&YQ,Y&aQ.`(mQ1e,VU1i,Z,[,]Q3V.aQ5n1fS5r1j1kQ8]5s#^<|#v$b$c$x${)u){*R*U*b+`+c+z+}.^/]/e/p/r1W1Z1c3T4Y4b4u4x5l6p7_7h8U8u9b9l:O:c:k;j;l;p;r;t;|<O<R<V<X<Z<]<a=U=Vo<};g;h;k;m;q;s;u;}<P<S<W<Y<[<^<bW%Ti%V*t<xS&X!Q&fQ&Y!RQ&Z!SR+y&V$}%Si#v$b$c$d$x${%O%Q%]%^%b)u){)}*P*R*U*[*b*r*s+`+c+z+}.^.w/]/e/o/p/r0V0X0d1W1Z1c3T3}4Y4b4m4u4x5l6p7_7h8U8u9T9b9l:O:c:k;g;h;j;k;l;m;p;q;r;s;t;u;|;}<O<P<R<S<V<W<X<Y<Z<[<]<^<a<b<x=Q=R=U=VT)v$u)wV*y%[;n;oW'X!e%g*V-WS(y#y#zQ+]%pQ+s&QS.Y(i(jQ1[,PQ4n0`R7{5^'OkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%k%r&P&h&k&l&o&q&r&t&x'Q'U'_'o(P(R(X(`(t(v(z)o)y+R+V+a,h,k,p,|-P-a-i-w-}._.l.s.}/f0a0g0v1d1t1u1w1y1|2P2R2b2r2x3U3^3u5`5b5m5}6O6R6]6f6t8R8X8h8r9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{$i$^c#Y#e%o%q%s(O(U(p(u(})O)P)Q)R)S)T)U)V)W)Y)[)^)c)m+^+r-R-p-u-z-|.k.n.r.t.u.v/X0e2]2`2p2w3]3b3c3d3e3f3g3h3i3j3k3l3m3n3q3r3y4r4{6_6e6j6y6z7T7U7}8l8p8z9Q9R9{:`:g;R<oT#TV#U'PkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%k%r&P&h&k&l&o&q&r&t&x'Q'U'_'o(P(R(X(`(t(v(z)o)y+R+V+a,h,k,p,|-P-a-i-w-}._.l.s.}/f0a0g0v1d1t1u1w1y1|2P2R2b2r2x3U3^3u5`5b5m5}6O6R6]6f6t8R8X8h8r9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{Q'V!eR2c-Tv!nQ!e!r!v!y!z'T'[']'i'j'k-T-Z-]-m1a5e5gU*d$|*V*jS/y*e*lQ0S*mQ1^,RQ4d0RR4g0UnqOXst!Z#d%k&o&q&r&t,k,p1|2PQ&v!^Q's!xS(o#u;XQ+f%xQ,T&[Q,U&^Q-b'aQ-o'lS.j(t;yS0f+R<TQ0s+gQ1`,SQ2T,rQ2V,sQ2_-OQ2l-cQ2o-gS4s0g<_Q4y0tS4|0v<`Q6^2aQ6b2mQ6g2tQ7p4zQ8m6`Q8n6cQ8q6hR9x8j$d$]c#Y#e%q%s(O(U(p(u(})O)P)Q)R)S)T)U)V)W)Y)[)^)c)m+^+r-R-p-u-z-|.k.n.r.u.v/X0e2]2`2p2w3]3b3c3d3e3f3g3h3i3j3k3l3m3n3q3r3y4r4{6_6e6j6y6z7T7U7}8l8p8z9Q9R9{:`:g;R<oS(k#p'fQ({#zS+[%o.tS.Z(j(lR3O.['OkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%k%r&P&h&k&l&o&q&r&t&x'Q'U'_'o(P(R(X(`(t(v(z)o)y+R+V+a,h,k,p,|-P-a-i-w-}._.l.s.}/f0a0g0v1d1t1u1w1y1|2P2R2b2r2x3U3^3u5`5b5m5}6O6R6]6f6t8R8X8h8r9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{S#q];QQ&q!XQ&r!YQ&t![Q&u!]R1{,nQ'^!hQ+_%uQ-`'`S.](m+bQ2j-_W3S.`.a0l0nQ6a2kW6n3P3R3V4wU8t6o6q6sU9}8v8w8yS:i9|:PQ:t:jR:z:uU!wQ']-]T5c1a5e!Q_OXZ`st!V!Z#d#h%c%k&f&h&o&q&r&t(f,k,p.S1|2P]!pQ!r']-]1a5eT#q];Q%[{OPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%k%r&P&h&k&l&o&q&r&t&x'Q'_'o(P(R(X(`(t(v(z)y+R+V+a,h,k,p-a-i-w-}._.l.s/f0a0g0v1d1t1u1w1y1|2P2R2r2x3U3^5b5m5}6O6R6f6t8R8X8h8rS(y#y#zS.Y(i(j!s<f$Z$n'U)o,|-P.}2b3u5`6]9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{U$fd)Z,eS(l#p'fU*q%R(s3pU0b*x.f7PQ4w0mQ6o3QQ8w6rR:P8xm!tQ!r!v!y!z']'i'j'k-]-m1a5e5gQ'q!uS(b#g1vS-k'h'tQ/k*XQ/w*dQ2v-nQ4U/lS4_/x0SQ7Z4PS7f4e4gQ9V7[Q9Z7cQ9`7iS:X9[9]S:n:Y:ZS:w:o:pR:}:xQ#wbQ'p!uS(a#g1vS(c#m+QQ+S%dQ+d%vQ+j%|U-j'h'q'tQ.O(bQ/j*XQ/v*dQ/|*gQ0r+eQ1g,XS2s-k-nQ2{.WS4T/k/lS4^/w0SQ4a/{Q4c/}Q5p1hQ6i2vQ7Y4PQ7^4US7b4_4gQ7g4fQ8Z5qS9U7Z7[Q9Y7cQ9^7fQ9a7jQ9o8[Q:V9VS:W9Z9]Q:[9`Q:e9pS:m:X:ZS:v:n:pQ:|:wQ;O:}Q<i<dQ<t<mR<u<nV!wQ']-]%[aOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%k%r&P&h&k&l&o&q&r&t&x'Q'_'o(P(R(X(`(t(v(z)y+R+V+a,h,k,p-a-i-w-}._.l.s/f0a0g0v1d1t1u1w1y1|2P2R2r2x3U3^5b5m5}6O6R6f6t8R8X8h8rS#wz!j!r<c$Z$n'U)o,|-P.}2b3u5`6]9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{R<i<z%[bOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%k%r&P&h&k&l&o&q&r&t&x'Q'_'o(P(R(X(`(t(v(z)y+R+V+a,h,k,p-a-i-w-}._.l.s/f0a0g0v1d1t1u1w1y1|2P2R2r2x3U3^5b5m5}6O6R6f6t8R8X8h8rQ%dj!S%vy!i!u%y%z%{'S'b'c'd'h'r*d+h+i-Q-d-e-l/y0u2g2n2u4dS%|z!jQ+e%wQ,X&aW1h,Y,Z,[,]U5q1i1j1kS8[5r5sQ9p8]!r<d$Z$n'U)o,|-P.}2b3u5`6]9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{Q<m<yR<n<z%OeOPXYstuvw!Z!`!g!o#S#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%k%r&P&h&k&o&q&r&t&x'Q'_'o(R(X(`(t(v(z)y+R+V+a,h,k,p-a-i-w-}._.l.s/f0a0g0v1d1t1u1w1y1|2P2R2r2x3U3^5b5m5}6O6R6f6t8R8X8h8rY#bWZ#W#Z(P!b%hm#h#i#l$x%c%f(Y(d(e(f*U*Y*]+T+U+W,g,}-{.R.S.T.V/e/h2U2|2}4Q6[6mQ,f&l!p<e$Z$n)o,|-P.}2b3u5`6]9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{R<h'UU'Y!e%g*VR2e-W%QdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%k%r&P&h&k&o&q&r&t&x'Q'_'o(P(R(X(`(t(v(z)y+R+V,h,k,p-a-i-w-}.l.s/f0a0g0v1d1t1u1w1y1|2P2R2r2x3^5b5m5}6O6R6f8R8X8h8r!r)Z$Z$n'U)o,|-P.}2b3u5`6]9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{Q,e&lQ0m+aQ3Q._Q6r3UR8x6t!b$Tc#Y%o(O(U(p(u)V)W)[)c+r-p-u-z-|.k.n/X0e2p2w3]3m4r4{6e6j6y8p9{;R!P;_)Y)m-R.t2]2`3b3k3l3q3y6_6z7T7U7}8l8z9Q9R:`:g<o!f$Vc#Y%o(O(U(p(u)S)T)V)W)[)c+r-p-u-z-|.k.n/X0e2p2w3]3m4r4{6e6j6y8p9{;R!T;a)Y)m-R.t2]2`3b3h3i3k3l3q3y6_6z7T7U7}8l8z9Q9R:`:g<o!^$Zc#Y%o(O(U(p(u)[)c+r-p-u-z-|.k.n/X0e2p2w3]3m4r4{6e6j6y8p9{;RQ3}/cz<{)Y)m-R.t2]2`3b3q3y6_6z7T7U7}8l8z9Q9R:`:g<oQ=Q=SR=R=T'OkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%k%r&P&h&k&l&o&q&r&t&x'Q'U'_'o(P(R(X(`(t(v(z)o)y+R+V+a,h,k,p,|-P-a-i-w-}._.l.s.}/f0a0g0v1d1t1u1w1y1|2P2R2b2r2x3U3^3u5`5b5m5}6O6R6]6f6t8R8X8h8r9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{S$oh$pR3v.|'VgOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n$p%k%r&P&h&k&l&o&q&r&t&x'Q'U'_'o(P(R(X(`(t(v(z)o)y+R+V+a,h,k,p,|-P-a-i-w-}._.l.s.|.}/f0a0g0v1d1t1u1w1y1|2P2R2b2r2x3U3^3u5`5b5m5}6O6R6]6f6t8R8X8h8r9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{T$kf$qQ$ifS)f$l)jR)r$qT$jf$qT)h$l)j'VhOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n$p%k%r&P&h&k&l&o&q&r&t&x'Q'U'_'o(P(R(X(`(t(v(z)o)y+R+V+a,h,k,p,|-P-a-i-w-}._.l.s.|.}/f0a0g0v1d1t1u1w1y1|2P2R2b2r2x3U3^3u5`5b5m5}6O6R6]6f6t8R8X8h8r9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{T$oh$pQ$rhR)q$p%[jOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%k%r&P&h&k&l&o&q&r&t&x'Q'_'o(P(R(X(`(t(v(z)y+R+V+a,h,k,p-a-i-w-}._.l.s/f0a0g0v1d1t1u1w1y1|2P2R2r2x3U3^5b5m5}6O6R6f6t8R8X8h8r!s<y$Z$n'U)o,|-P.}2b3u5`6]9h9y;P;S;T;W;X;Y;Z;[;];^;_;`;a;b;c;d;f;i;v;x;y;{<T<U<_<`<{#elOPXZst!Z!`!o#S#d#o#{$n%k&h&k&l&o&q&r&t&x'Q'_(z)o+V+a,h,k,p-a._.}/f0a1d1t1u1w1y1|2P2R3U3u5b5m5}6O6R6t8R8X8h!O%Ri$d%O%Q%]%^%b)}*P*[*r*s.w/o0V0X0d3}4m9T<x=Q=R#^(s#v$b$c$x${)u){*R*U*b+`+c+z+}.^/]/e/p/r1W1Z1c3T4Y4b4u4x5l6p7_7h8U8u9b9l:O:c:k;j;l;p;r;t;|<O<R<V<X<Z<]<a=U=VQ*}%`Q/Y)zo3p;g;h;k;m;q;s;u;}<P<S<W<Y<[<^<b!O$yi$d%O%Q%]%^%b)}*P*[*r*s.w/o0V0X0d3}4m9T<x=Q=RQ*^$zU*g$|*V*jQ+O%aQ/}*h#^<k#v$b$c$x${)u){*R*U*b+`+c+z+}.^/]/e/p/r1W1Z1c3T4Y4b4u4x5l6p7_7h8U8u9b9l:O:c:k;j;l;p;r;t;|<O<R<V<X<Z<]<a=U=Vn<l;g;h;k;m;q;s;u;}<P<S<W<Y<[<^<bQ<p<|Q<q<}Q<r=OR<s=P!O%Ri$d%O%Q%]%^%b)}*P*[*r*s.w/o0V0X0d3}4m9T<x=Q=R#^(s#v$b$c$x${)u){*R*U*b+`+c+z+}.^/]/e/p/r1W1Z1c3T4Y4b4u4x5l6p7_7h8U8u9b9l:O:c:k;j;l;p;r;t;|<O<R<V<X<Z<]<a=U=Vo3p;g;h;k;m;q;s;u;}<P<S<W<Y<[<^<bnoOXst!Z#d%k&o&q&r&t,k,p1|2PS*a${*UQ,y&{Q,z&}R4X/p$|%Si#v$b$c$d$x${%O%Q%]%^%b)u){)}*P*R*U*[*b*r*s+`+c+z+}.^.w/]/e/o/p/r0V0X0d1W1Z1c3T3}4Y4b4m4u4x5l6p7_7h8U8u9T9b9l:O:c:k;g;h;j;k;l;m;p;q;r;s;t;u;|;}<O<P<R<S<V<W<X<Y<Z<[<]<^<a<b<x=Q=R=U=VQ+|&YQ1Y,OQ5[1XR7z5]V*i$|*V*jU*i$|*V*jT5d1a5eU/{*f/f5bS4f0T8RR7j4hQ+d%vQ/|*gQ0r+eQ1g,XQ5p1hQ8Z5qQ9o8[R:e9p!O%Oi$d%O%Q%]%^%b)}*P*[*r*s.w/o0V0X0d3}4m9T<x=Q=Rr)}$v)a*O*p+P/n0Z0[3s4V4q7X7k:U<j<v<wS0V*o0W#^;j#v$b$c$x${)u){*R*U*b+`+c+z+}.^/]/e/p/r1W1Z1c3T4Y4b4u4x5l6p7_7h8U8u9b9l:O:c:k;j;l;p;r;t;|<O<R<V<X<Z<]<a=U=Vn;k;g;h;k;m;q;s;u;}<P<S<W<Y<[<^<b!`;|(q)_*W*`.b.e.i/U/Z/c/s0k1V1X3Y4W4[5Z5]6u6x7`7d7m7o9X9_:]:l=S=T`;}3o6{7O7S8{:Q:T:{S<X.d3ZT<Y6}9O!O%Qi$d%O%Q%]%^%b)}*P*[*r*s.w/o0V0X0d3}4m9T<x=Q=Rv*P$v)a*Q*o+P/_/n0Z0[3s4V4i4q7X7k:U<j<v<wS0X*p0Y#^;l#v$b$c$x${)u){*R*U*b+`+c+z+}.^/]/e/p/r1W1Z1c3T4Y4b4u4x5l6p7_7h8U8u9b9l:O:c:k;j;l;p;r;t;|<O<R<V<X<Z<]<a=U=Vn;m;g;h;k;m;q;s;u;}<P<S<W<Y<[<^<b!d<O(q)_*W*`.c.d.i/U/Z/c/s0k1V1X3W3Y4W4[5Z5]6u6v6x7`7d7m7o9X9_:]:l=S=Td<P3o6|6}7S8{8|:Q:R:T:{S<Z.e3[T<[7O9PrnOXst!V!Z#d%k&f&o&q&r&t,k,p1|2PQ&c!UR,h&lrnOXst!V!Z#d%k&f&o&q&r&t,k,p1|2PR&c!UQ,Q&ZR1U+ysnOXst!V!Z#d%k&f&o&q&r&t,k,p1|2PQ1b,VS5k1e1fU8T5i5j5nS9k8V8WS:a9j9mQ:q:bR:y:rQ&j!VR,a&fR5w1nS&O|&TR0}+pQ&o!WR,k&pR,q&uT1},p2PR,u&vQ,t&vR2W,uQ'v!{R-q'vSsOtQ#dXT%ns#dQ#OTR'x#OQ#RUR'z#RQ)w$uR/V)wQ#UVR'|#UQ#XWU(S#X(T-xQ(T#YR-x(UQ-U'VR2d-UQ.m(uS3_.m3`R3`.nQ-]']R2h-]Y!rQ']-]1a5eR'g!rQ.x)aR3t.xU#_W%f*UU(Z#_([-yQ([#`R-y(VQ-X'YR2f-Xt`OXst!V!Z#d%k&f&h&o&q&r&t,k,p1|2PS#hZ%cU#r`#h.SR.S(fQ(g#jQ.P(cW.X(g.P2y6kQ2y.QR6k2zQ)j$lR/O)jQ$phR)p$pQ$`cU)]$`-t;eQ-t;RR;e)mQ/i*XW4R/i4S7]9WU4S/j/k/lS7]4T4UR9W7^$Z)|$v(q)_)a*W*`*o*p*z*{+P.d.e.g.h.i/U/Z/_/a/c/n/s0Z0[0k1V1X3W3X3Y3o3s4V4W4[4i4k4q5Z5]6u6v6w6x6}7O7Q7R7S7X7`7d7k7m7o8{8|8}9X9_:Q:R:S:T:U:]:l:{<j<v<w=S=TQ/q*`U4Z/q4]7aQ4]/sR7a4[S*j$|*VR0P*jr*O$v)a*o*p+P/n0Z0[3s4V4q7X7k:U<j<v<w!`.b(q)_*W*`.d.e.i/U/Z/c/s0k1V1X3Y4W4[5Z5]6u6x7`7d7m7o9X9_:]:l=S=TU/`*O.b6{a6{3o6}7O7S8{:Q:T:{Q0W*oQ3Z.dU4j0W3Z9OR9O6}v*Q$v)a*o*p+P/_/n0Z0[3s4V4i4q7X7k:U<j<v<w!d.c(q)_*W*`.d.e.i/U/Z/c/s0k1V1X3W3Y4W4[5Z5]6u6v6x7`7d7m7o9X9_:]:l=S=TU/b*Q.c6|e6|3o6}7O7S8{8|:Q:R:T:{Q0Y*pQ3[.eU4l0Y3[9PR9P7OQ*u%UR0^*uQ4v0kR7n4vQ+X%iR0j+XQ5_1[S7|5_9iR9i7}Q,S&[R1_,SQ5e1aR8P5eQ1m,^S5u1m8_R8_5wQ0x+lW5Q0x5S7t9eQ5S0{Q7t5RR9e7uQ+q&OR1O+qQ2P,pR6V2PYrOXst#dQ&s!ZQ+Z%kQ,j&oQ,l&qQ,m&rQ,o&tQ1z,kS1},p2PR6U1|Q%mpQ&w!_Q&z!aQ&|!bQ'O!cQ'n!uQ+Y%jQ+f%xQ+x&UQ,`&jQ,w&yW-h'h'p'q'tQ-o'lQ0O*iQ0s+gS1p,a,dQ2X,vQ2Y,yQ2Z,zQ2o-gW2q-j-k-n-pQ4y0tQ5V1RQ5Y1VQ5o1gQ5y1rQ6T1{U6d2p2s2vQ6g2tQ7p4zQ7x5XQ7y5ZQ8O5dQ8Y5pQ8`5xS8o6e6iQ8q6hQ9f7vQ9n8ZQ9s8aQ9z8pQ:_9gQ:d9oQ:h9{R:s:eQ%xyQ'a!iQ'l!uU+g%y%z%{Q-O'SU-c'b'c'dS-g'h'rQ/u*dS0t+h+iQ2a-QS2m-d-eQ2t-lQ4`/yQ4z0uQ6`2gQ6c2nQ6h2uR7e4dS$wi<xR*v%VU%Ui%V<xR0]*tQ$viS(q#v+cS)_$b$cQ)a$dQ*W$xS*`${*UQ*o%OQ*p%QQ*z%]Q*{%^Q+P%bQ.d;jQ.e;lQ.g;pQ.h;rQ.i;tQ/U)uS/Z){/]Q/_)}Q/a*PQ/c*RQ/n*[S/s*b/eQ0Z*rQ0[*sh0k+`.^1c3T5l6p8U8u9l:O:c:kQ1V+zQ1X+}Q3W;|Q3X<OQ3Y<RS3o;g;hQ3s.wQ4V/oQ4W/pQ4[/rQ4i0VQ4k0XQ4q0dQ5Z1WQ5]1ZQ6u<VQ6v<XQ6w<ZQ6x<]Q6};kQ7O;mQ7Q;qQ7R;sQ7S;uQ7X3}Q7`4YQ7d4bQ7k4mQ7m4uQ7o4xQ8{<SQ8|;}Q8}<PQ9X7_Q9_7hQ:Q<WQ:R<YQ:S<[Q:T<^Q:U9TQ:]9bQ:l<aQ:{<bQ<j<xQ<v=QQ<w=RQ=S=UR=T=VQ*x%[Q.f;nR7P;onpOXst!Z#d%k&o&q&r&t,k,p1|2PQ!fPS#fZ#oQ&y!`U'e!o5b8RQ'{#SQ(|#{Q)n$nS,d&h&kQ,i&lQ,v&xQ,{'QQ-_'_Q.p(zQ/S)oS0h+V/fQ0n+aQ1x,hQ2k-aQ3R._Q3x.}Q4o0aQ5j1dQ5{1tQ5|1uQ6Q1wQ6S1yQ6X2RQ6s3UQ7V3uQ8W5mQ8d5}Q8e6OQ8g6RQ8y6tQ9m8XR9w8h#YcOPXZst!Z!`!o#d#o#{%k&h&k&l&o&q&r&t&x'Q'_(z+V+a,h,k,p-a._/f0a1d1t1u1w1y1|2P2R3U5b5m5}6O6R6t8R8X8hQ#YWQ#eYQ%ouQ%qvS%sw!gS(O#W(RQ(U#ZQ(p#uQ(u#xQ(}$OQ)O$PQ)P$QQ)Q$RQ)R$SQ)S$TQ)T$UQ)U$VQ)V$WQ)W$XQ)Y$ZQ)[$_Q)^$aQ)c$eW)m$n)o.}3uQ+^%rQ+r&PS-R'U2bQ-p'oS-u(P-wQ-z(XQ-|(`Q.k(tQ.n(vQ.r;PQ.t;SQ.u;TQ.v;WQ/X)yQ0e+RQ2],|Q2`-PQ2p-iQ2w-}Q3].lQ3b;XQ3c;YQ3d;ZQ3e;[Q3f;]Q3g;^Q3h;_Q3i;`Q3j;aQ3k;bQ3l;cQ3m.sQ3n;fQ3q;iQ3r;vQ3y;dQ4r0gQ4{0vQ6_;xQ6e2rQ6j2xQ6y3^Q6z;yQ7T;{Q7U<TQ7}5`Q8l6]Q8p6fQ8z<UQ9Q<_Q9R<`Q9{8rQ:`9hQ:g9yQ;R#SR<o<{R#[WR'W!el!tQ!r!v!y!z']'i'j'k-]-m1a5e5gS'S!e-TS-Q'T'[R2g-ZR(w#xQ!fQT-[']-]]!qQ!r']-]1a5eQ#p]R'f;QR)b$dY!uQ']-]1a5eQ'h!rS'r!v!yS't!z5gS-l'i'jQ-n'kR2u-mT#kZ%cS#jZ%cS%im,gU(c#h#i#lS.Q(d(eQ.U(fQ0i+WQ2z.RU2{.S.T.VS6l2|2}R8s6md#^W#W#Z%f(P(Y*U+T-{/er#gZm#h#i#l%c(d(e(f+W.R.S.T.V2|2}6mS*X$x*]Q/l*YQ1v,gQ2^,}Q4P/hQ6Z2UQ7[4QQ8k6[T<g'U+UV#aW%f*UU#`W%f*US(Q#W(YU(V#Z+T/eS-S'U+UT-v(P-{V'Z!e%g*VQ$lfR)t$qT)i$l)jR3w.|T*Z$x*]T*c${*UQ0l+`Q3P.^Q5i1cQ6q3TQ8V5lQ8v6pQ9j8UQ9|8uQ:b9lQ:j:OQ:r:cR:u:knqOXst!Z#d%k&o&q&r&t,k,p1|2PQ&i!VR,`&ftmOXst!U!V!Z#d%k&f&o&q&r&t,k,p1|2PR,g&lT%jm,gR1],PR,_&dQ&S|R+w&TR+m%}T&m!W&pT&n!W&pT2O,p2P",
  nodeNames: "⚠ ArithOp ArithOp ?. JSXStartTag LineComment BlockComment Script Hashbang ExportDeclaration export Star as VariableName String Escape from ; default FunctionDeclaration async function VariableDefinition > < TypeParamList TypeDefinition extends ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation InterpolationStart NullType null VoidType void TypeofType typeof MemberExpression . PropertyName [ TemplateString Escape Interpolation super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewTarget new NewExpression ) ( ArgList UnaryExpression delete LogicOp BitOp YieldExpression yield AwaitExpression await ParenthesizedExpression ClassExpression class ClassBody MethodDeclaration Decorator @ MemberExpression PrivatePropertyName CallExpression TypeArgList CompareOp < declare Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly accessor Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof satisfies in const CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression InstantiationExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXSelfClosingTag JSXIdentifier JSXBuiltin JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression InstantiationExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature PropertyDefinition CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var using TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement SingleExpression SingleClassItem",
  maxTerm: 376,
  context: g1,
  nodeProps: [
    ["isolate", -8, 5, 6, 14, 34, 36, 48, 50, 52, ""],
    ["group", -26, 9, 17, 19, 65, 204, 208, 212, 213, 215, 218, 221, 231, 233, 239, 241, 243, 245, 248, 254, 260, 262, 264, 266, 268, 270, 271, "Statement", -34, 13, 14, 29, 32, 33, 39, 48, 51, 52, 54, 59, 67, 69, 73, 77, 79, 81, 82, 107, 108, 117, 118, 135, 138, 140, 141, 142, 143, 144, 146, 147, 166, 167, 169, "Expression", -23, 28, 30, 34, 38, 40, 42, 171, 173, 175, 176, 178, 179, 180, 182, 183, 184, 186, 187, 188, 198, 200, 202, 203, "Type", -3, 85, 100, 106, "ClassItem"],
    ["openedBy", 23, "<", 35, "InterpolationStart", 53, "[", 57, "{", 70, "(", 159, "JSXStartCloseTag"],
    ["closedBy", 24, ">", 37, "InterpolationEnd", 47, "]", 58, "}", 71, ")", 164, "JSXEndTag"]
  ],
  propSources: [k1],
  skippedNodes: [0, 5, 6, 274],
  repeatNodeCount: 37,
  tokenData: "$Fq07[R!bOX%ZXY+gYZ-yZ[+g[]%Z]^.c^p%Zpq+gqr/mrs3cst:_tuEruvJSvwLkwx! Yxy!'iyz!(sz{!)}{|!,q|}!.O}!O!,q!O!P!/Y!P!Q!9j!Q!R#:O!R![#<_![!]#I_!]!^#Jk!^!_#Ku!_!`$![!`!a$$v!a!b$*T!b!c$,r!c!}Er!}#O$-|#O#P$/W#P#Q$4o#Q#R$5y#R#SEr#S#T$7W#T#o$8b#o#p$<r#p#q$=h#q#r$>x#r#s$@U#s$f%Z$f$g+g$g#BYEr#BY#BZ$A`#BZ$ISEr$IS$I_$A`$I_$I|Er$I|$I}$Dk$I}$JO$Dk$JO$JTEr$JT$JU$A`$JU$KVEr$KV$KW$A`$KW&FUEr&FU&FV$A`&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$A`?HUOEr(n%d_$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&j&hT$h&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c&j&zP;=`<%l&c'|'U]$h&j(U!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!b(SU(U!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!b(iP;=`<%l'}'|(oP;=`<%l&}'[(y]$h&j(RpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rp)wU(RpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)rp*^P;=`<%l)r'[*dP;=`<%l(r#S*nX(Rp(U!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g#S+^P;=`<%l*g(n+dP;=`<%l%Z07[+rq$h&j(Rp(U!b'w0/lOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p$f%Z$f$g+g$g#BY%Z#BY#BZ+g#BZ$IS%Z$IS$I_+g$I_$JT%Z$JT$JU+g$JU$KV%Z$KV$KW+g$KW&FU%Z&FU&FV+g&FV;'S%Z;'S;=`+a<%l?HT%Z?HT?HU+g?HUO%Z07[.ST(S#S$h&j'x0/lO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c07[.n_$h&j(Rp(U!b'x0/lOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)3p/x`$h&j!m),Q(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW1V`#u(Ch$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`2X!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW2d_#u(Ch$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'At3l_(Q':f$h&j(U!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k(^4r_$h&j(U!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k&z5vX$h&jOr5qrs6cs!^5q!^!_6y!_#o5q#o#p6y#p;'S5q;'S;=`7h<%lO5q&z6jT$c`$h&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c`6|TOr6yrs7]s;'S6y;'S;=`7b<%lO6y`7bO$c``7eP;=`<%l6y&z7kP;=`<%l5q(^7w]$c`$h&j(U!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!r8uZ(U!bOY8pYZ6yZr8prs9hsw8pwx6yx#O8p#O#P6y#P;'S8p;'S;=`:R<%lO8p!r9oU$c`(U!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!r:UP;=`<%l8p(^:[P;=`<%l4k%9[:hh$h&j(Rp(U!bOY%ZYZ&cZq%Zqr<Srs&}st%ZtuCruw%Zwx(rx!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr(r<__WS$h&j(Rp(U!bOY<SYZ&cZr<Srs=^sw<Swx@nx!^<S!^!_Bm!_#O<S#O#P>`#P#o<S#o#pBm#p;'S<S;'S;=`Cl<%lO<S(Q=g]WS$h&j(U!bOY=^YZ&cZw=^wx>`x!^=^!^!_?q!_#O=^#O#P>`#P#o=^#o#p?q#p;'S=^;'S;=`@h<%lO=^&n>gXWS$h&jOY>`YZ&cZ!^>`!^!_?S!_#o>`#o#p?S#p;'S>`;'S;=`?k<%lO>`S?XSWSOY?SZ;'S?S;'S;=`?e<%lO?SS?hP;=`<%l?S&n?nP;=`<%l>`!f?xWWS(U!bOY?qZw?qwx?Sx#O?q#O#P?S#P;'S?q;'S;=`@b<%lO?q!f@eP;=`<%l?q(Q@kP;=`<%l=^'`@w]WS$h&j(RpOY@nYZ&cZr@nrs>`s!^@n!^!_Ap!_#O@n#O#P>`#P#o@n#o#pAp#p;'S@n;'S;=`Bg<%lO@ntAwWWS(RpOYApZrAprs?Ss#OAp#O#P?S#P;'SAp;'S;=`Ba<%lOAptBdP;=`<%lAp'`BjP;=`<%l@n#WBvYWS(Rp(U!bOYBmZrBmrs?qswBmwxApx#OBm#O#P?S#P;'SBm;'S;=`Cf<%lOBm#WCiP;=`<%lBm(rCoP;=`<%l<S%9[C}i$h&j(j%1l(Rp(U!bOY%ZYZ&cZr%Zrs&}st%ZtuCruw%Zwx(rx!Q%Z!Q![Cr![!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr%9[EoP;=`<%lCr07[FRk$h&j(Rp(U!b$[#t(O,2j(`$I[OY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr+dHRk$h&j(Rp(U!b$[#tOY%ZYZ&cZr%Zrs&}st%ZtuGvuw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Gv![!^%Z!^!_*g!_!c%Z!c!}Gv!}#O%Z#O#P&c#P#R%Z#R#SGv#S#T%Z#T#oGv#o#p*g#p$g%Z$g;'SGv;'S;=`Iv<%lOGv+dIyP;=`<%lGv07[JPP;=`<%lEr(KWJ_`$h&j(Rp(U!b#m(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KWKl_$h&j$P(Ch(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z,#xLva(u+JY$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sv%ZvwM{wx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KWNW`$h&j#y(Ch(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'At! c_(T';W$h&j(RpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b'l!!i_$h&j(RpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b&z!#mX$h&jOw!#hwx6cx!^!#h!^!_!$Y!_#o!#h#o#p!$Y#p;'S!#h;'S;=`!$r<%lO!#h`!$]TOw!$Ywx7]x;'S!$Y;'S;=`!$l<%lO!$Y`!$oP;=`<%l!$Y&z!$uP;=`<%l!#h'l!%R]$c`$h&j(RpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r!Q!&PZ(RpOY!%zYZ!$YZr!%zrs!$Ysw!%zwx!&rx#O!%z#O#P!$Y#P;'S!%z;'S;=`!']<%lO!%z!Q!&yU$c`(RpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)r!Q!'`P;=`<%l!%z'l!'fP;=`<%l!!b/5|!'t_!i/.^$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#&U!)O_!h!Lf$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z-!n!*[b$h&j(Rp(U!b(P%&f#n(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rxz%Zz{!+d{!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW!+o`$h&j(Rp(U!b#k(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z+;x!,|`$h&j(Rp(U!bo+4YOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z,$U!.Z_!Y+Jf$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[!/ec$h&j(Rp(U!b}.2^OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!0p!P!Q%Z!Q![!3Y![!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#%|!0ya$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!2O!P!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#%|!2Z_!X!L^$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!3eg$h&j(Rp(U!bp'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!3Y![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S!3Y#S#X%Z#X#Y!4|#Y#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!5Vg$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx{%Z{|!6n|}%Z}!O!6n!O!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!6wc$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!8_c$h&j(Rp(U!bp'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[!9uf$h&j(Rp(U!b#l(ChOY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcxz!;Zz{#-}{!P!;Z!P!Q#/d!Q!^!;Z!^!_#(i!_!`#7S!`!a#8i!a!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z?O!;fb$h&j(Rp(U!b!U7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z>^!<w`$h&j(U!b!U7`OY!<nYZ&cZw!<nwx!=yx!P!<n!P!Q!Eq!Q!^!<n!^!_!Gr!_!}!<n!}#O!KS#O#P!Dy#P#o!<n#o#p!Gr#p;'S!<n;'S;=`!L]<%lO!<n<z!>Q^$h&j!U7`OY!=yYZ&cZ!P!=y!P!Q!>|!Q!^!=y!^!_!@c!_!}!=y!}#O!CW#O#P!Dy#P#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y<z!?Td$h&j!U7`O!^&c!_#W&c#W#X!>|#X#Z&c#Z#[!>|#[#]&c#]#^!>|#^#a&c#a#b!>|#b#g&c#g#h!>|#h#i&c#i#j!>|#j#k!>|#k#m&c#m#n!>|#n#o&c#p;'S&c;'S;=`&w<%lO&c7`!@hX!U7`OY!@cZ!P!@c!P!Q!AT!Q!}!@c!}#O!Ar#O#P!Bq#P;'S!@c;'S;=`!CQ<%lO!@c7`!AYW!U7`#W#X!AT#Z#[!AT#]#^!AT#a#b!AT#g#h!AT#i#j!AT#j#k!AT#m#n!AT7`!AuVOY!ArZ#O!Ar#O#P!B[#P#Q!@c#Q;'S!Ar;'S;=`!Bk<%lO!Ar7`!B_SOY!ArZ;'S!Ar;'S;=`!Bk<%lO!Ar7`!BnP;=`<%l!Ar7`!BtSOY!@cZ;'S!@c;'S;=`!CQ<%lO!@c7`!CTP;=`<%l!@c<z!C][$h&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#O!CW#O#P!DR#P#Q!=y#Q#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW<z!DWX$h&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW<z!DvP;=`<%l!CW<z!EOX$h&jOY!=yYZ&cZ!^!=y!^!_!@c!_#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y<z!EnP;=`<%l!=y>^!Ezl$h&j(U!b!U7`OY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#W&}#W#X!Eq#X#Z&}#Z#[!Eq#[#]&}#]#^!Eq#^#a&}#a#b!Eq#b#g&}#g#h!Eq#h#i&}#i#j!Eq#j#k!Eq#k#m&}#m#n!Eq#n#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}8r!GyZ(U!b!U7`OY!GrZw!Grwx!@cx!P!Gr!P!Q!Hl!Q!}!Gr!}#O!JU#O#P!Bq#P;'S!Gr;'S;=`!J|<%lO!Gr8r!Hse(U!b!U7`OY'}Zw'}x#O'}#P#W'}#W#X!Hl#X#Z'}#Z#[!Hl#[#]'}#]#^!Hl#^#a'}#a#b!Hl#b#g'}#g#h!Hl#h#i'}#i#j!Hl#j#k!Hl#k#m'}#m#n!Hl#n;'S'};'S;=`(f<%lO'}8r!JZX(U!bOY!JUZw!JUwx!Arx#O!JU#O#P!B[#P#Q!Gr#Q;'S!JU;'S;=`!Jv<%lO!JU8r!JyP;=`<%l!JU8r!KPP;=`<%l!Gr>^!KZ^$h&j(U!bOY!KSYZ&cZw!KSwx!CWx!^!KS!^!_!JU!_#O!KS#O#P!DR#P#Q!<n#Q#o!KS#o#p!JU#p;'S!KS;'S;=`!LV<%lO!KS>^!LYP;=`<%l!KS>^!L`P;=`<%l!<n=l!Ll`$h&j(Rp!U7`OY!LcYZ&cZr!Lcrs!=ys!P!Lc!P!Q!Mn!Q!^!Lc!^!_# o!_!}!Lc!}#O#%P#O#P!Dy#P#o!Lc#o#p# o#p;'S!Lc;'S;=`#&Y<%lO!Lc=l!Mwl$h&j(Rp!U7`OY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#W(r#W#X!Mn#X#Z(r#Z#[!Mn#[#](r#]#^!Mn#^#a(r#a#b!Mn#b#g(r#g#h!Mn#h#i(r#i#j!Mn#j#k!Mn#k#m(r#m#n!Mn#n#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r8Q# vZ(Rp!U7`OY# oZr# ors!@cs!P# o!P!Q#!i!Q!}# o!}#O#$R#O#P!Bq#P;'S# o;'S;=`#$y<%lO# o8Q#!pe(Rp!U7`OY)rZr)rs#O)r#P#W)r#W#X#!i#X#Z)r#Z#[#!i#[#])r#]#^#!i#^#a)r#a#b#!i#b#g)r#g#h#!i#h#i)r#i#j#!i#j#k#!i#k#m)r#m#n#!i#n;'S)r;'S;=`*Z<%lO)r8Q#$WX(RpOY#$RZr#$Rrs!Ars#O#$R#O#P!B[#P#Q# o#Q;'S#$R;'S;=`#$s<%lO#$R8Q#$vP;=`<%l#$R8Q#$|P;=`<%l# o=l#%W^$h&j(RpOY#%PYZ&cZr#%Prs!CWs!^#%P!^!_#$R!_#O#%P#O#P!DR#P#Q!Lc#Q#o#%P#o#p#$R#p;'S#%P;'S;=`#&S<%lO#%P=l#&VP;=`<%l#%P=l#&]P;=`<%l!Lc?O#&kn$h&j(Rp(U!b!U7`OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#W%Z#W#X#&`#X#Z%Z#Z#[#&`#[#]%Z#]#^#&`#^#a%Z#a#b#&`#b#g%Z#g#h#&`#h#i%Z#i#j#&`#j#k#&`#k#m%Z#m#n#&`#n#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z9d#(r](Rp(U!b!U7`OY#(iZr#(irs!Grsw#(iwx# ox!P#(i!P!Q#)k!Q!}#(i!}#O#+`#O#P!Bq#P;'S#(i;'S;=`#,`<%lO#(i9d#)th(Rp(U!b!U7`OY*gZr*grs'}sw*gwx)rx#O*g#P#W*g#W#X#)k#X#Z*g#Z#[#)k#[#]*g#]#^#)k#^#a*g#a#b#)k#b#g*g#g#h#)k#h#i*g#i#j#)k#j#k#)k#k#m*g#m#n#)k#n;'S*g;'S;=`+Z<%lO*g9d#+gZ(Rp(U!bOY#+`Zr#+`rs!JUsw#+`wx#$Rx#O#+`#O#P!B[#P#Q#(i#Q;'S#+`;'S;=`#,Y<%lO#+`9d#,]P;=`<%l#+`9d#,cP;=`<%l#(i?O#,o`$h&j(Rp(U!bOY#,fYZ&cZr#,frs!KSsw#,fwx#%Px!^#,f!^!_#+`!_#O#,f#O#P!DR#P#Q!;Z#Q#o#,f#o#p#+`#p;'S#,f;'S;=`#-q<%lO#,f?O#-tP;=`<%l#,f?O#-zP;=`<%l!;Z07[#.[b$h&j(Rp(U!b'y0/l!U7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z07[#/o_$h&j(Rp(U!bT0/lOY#/dYZ&cZr#/drs#0nsw#/dwx#4Ox!^#/d!^!_#5}!_#O#/d#O#P#1p#P#o#/d#o#p#5}#p;'S#/d;'S;=`#6|<%lO#/d06j#0w]$h&j(U!bT0/lOY#0nYZ&cZw#0nwx#1px!^#0n!^!_#3R!_#O#0n#O#P#1p#P#o#0n#o#p#3R#p;'S#0n;'S;=`#3x<%lO#0n05W#1wX$h&jT0/lOY#1pYZ&cZ!^#1p!^!_#2d!_#o#1p#o#p#2d#p;'S#1p;'S;=`#2{<%lO#1p0/l#2iST0/lOY#2dZ;'S#2d;'S;=`#2u<%lO#2d0/l#2xP;=`<%l#2d05W#3OP;=`<%l#1p01O#3YW(U!bT0/lOY#3RZw#3Rwx#2dx#O#3R#O#P#2d#P;'S#3R;'S;=`#3r<%lO#3R01O#3uP;=`<%l#3R06j#3{P;=`<%l#0n05x#4X]$h&j(RpT0/lOY#4OYZ&cZr#4Ors#1ps!^#4O!^!_#5Q!_#O#4O#O#P#1p#P#o#4O#o#p#5Q#p;'S#4O;'S;=`#5w<%lO#4O00^#5XW(RpT0/lOY#5QZr#5Qrs#2ds#O#5Q#O#P#2d#P;'S#5Q;'S;=`#5q<%lO#5Q00^#5tP;=`<%l#5Q05x#5zP;=`<%l#4O01p#6WY(Rp(U!bT0/lOY#5}Zr#5}rs#3Rsw#5}wx#5Qx#O#5}#O#P#2d#P;'S#5};'S;=`#6v<%lO#5}01p#6yP;=`<%l#5}07[#7PP;=`<%l#/d)3h#7ab$h&j$P(Ch(Rp(U!b!U7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;ZAt#8vb$Y#t$h&j(Rp(U!b!U7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z'Ad#:Zp$h&j(Rp(U!bp'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#U%Z#U#V#?i#V#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#d#Bq#d#l%Z#l#m#Es#m#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#<jk$h&j(Rp(U!bp'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#>j_$h&j(Rp(U!bp'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#?rd$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#A]f$h&j(Rp(U!bp'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Bzc$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Dbe$h&j(Rp(U!bp'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#E|g$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Gpi$h&j(Rp(U!bp'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z*)x#Il_!d$b$h&j#})Lv(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)[#Jv_al$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z04f#LS^h#)`#O-<U(Rp(U!b(y7`OY*gZr*grs'}sw*gwx)rx!P*g!P!Q#MO!Q!^*g!^!_#Mt!_!`$ f!`#O*g#P;'S*g;'S;=`+Z<%lO*g(n#MXX$j&j(Rp(U!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g(El#M}Z#o(Ch(Rp(U!bOY*gZr*grs'}sw*gwx)rx!_*g!_!`#Np!`#O*g#P;'S*g;'S;=`+Z<%lO*g(El#NyX$P(Ch(Rp(U!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g(El$ oX#p(Ch(Rp(U!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g*)x$!ga#]*!Y$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`!a$#l!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(K[$#w_#h(Cl$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z*)x$%Vag!*r#p(Ch$e#|$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`$&[!`!a$'f!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$&g_#p(Ch$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$'qa#o(Ch$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`!a$(v!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$)R`#o(Ch$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(Kd$*`a(m(Ct$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!a%Z!a!b$+e!b#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$+p`$h&j#z(Ch(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#`$,}_!y$Ip$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z04f$.X_!P0,v$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(n$/]Z$h&jO!^$0O!^!_$0f!_#i$0O#i#j$0k#j#l$0O#l#m$2^#m#o$0O#o#p$0f#p;'S$0O;'S;=`$4i<%lO$0O(n$0VT_#S$h&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c#S$0kO_#S(n$0p[$h&jO!Q&c!Q![$1f![!^&c!_!c&c!c!i$1f!i#T&c#T#Z$1f#Z#o&c#o#p$3|#p;'S&c;'S;=`&w<%lO&c(n$1kZ$h&jO!Q&c!Q![$2^![!^&c!_!c&c!c!i$2^!i#T&c#T#Z$2^#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$2cZ$h&jO!Q&c!Q![$3U![!^&c!_!c&c!c!i$3U!i#T&c#T#Z$3U#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$3ZZ$h&jO!Q&c!Q![$0O![!^&c!_!c&c!c!i$0O!i#T&c#T#Z$0O#Z#o&c#p;'S&c;'S;=`&w<%lO&c#S$4PR!Q![$4Y!c!i$4Y#T#Z$4Y#S$4]S!Q![$4Y!c!i$4Y#T#Z$4Y#q#r$0f(n$4lP;=`<%l$0O#1[$4z_!V#)l$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$6U`#w(Ch$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z+;p$7c_$h&j(Rp(U!b([+4QOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[$8qk$h&j(Rp(U!b(O,2j$^#t(`$I[OY%ZYZ&cZr%Zrs&}st%Ztu$8buw%Zwx(rx}%Z}!O$:f!O!Q%Z!Q![$8b![!^%Z!^!_*g!_!c%Z!c!}$8b!}#O%Z#O#P&c#P#R%Z#R#S$8b#S#T%Z#T#o$8b#o#p*g#p$g%Z$g;'S$8b;'S;=`$<l<%lO$8b+d$:qk$h&j(Rp(U!b$^#tOY%ZYZ&cZr%Zrs&}st%Ztu$:fuw%Zwx(rx}%Z}!O$:f!O!Q%Z!Q![$:f![!^%Z!^!_*g!_!c%Z!c!}$:f!}#O%Z#O#P&c#P#R%Z#R#S$:f#S#T%Z#T#o$:f#o#p*g#p$g%Z$g;'S$:f;'S;=`$<f<%lO$:f+d$<iP;=`<%l$:f07[$<oP;=`<%l$8b#Jf$<{X![#Hb(Rp(U!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g,#x$=sa(t+JY$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p#q$+e#q;'S%Z;'S;=`+a<%lO%Z(Kd$?V_!Z(Cds`$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z?O$@a_!n7`$h&j(Rp(U!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[$Aq|$h&j(Rp(U!b'w0/l$[#t(O,2j(`$I[OX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$f%Z$f$g+g$g#BYEr#BY#BZ$A`#BZ$ISEr$IS$I_$A`$I_$JTEr$JT$JU$A`$JU$KVEr$KV$KW$A`$KW&FUEr&FU&FV$A`&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$A`?HUOEr07[$D|k$h&j(Rp(U!b'x0/l$[#t(O,2j(`$I[OY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr",
  tokenizers: [S1, y1, x1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, b1, new $n("$S~RRtu[#O#Pg#S#T#|~_P#o#pb~gOu~~jVO#i!P#i#j!U#j#l!P#l#m!q#m;'S!P;'S;=`#v<%lO!P~!UO!R~~!XS!Q![!e!c!i!e#T#Z!e#o#p#Z~!hR!Q![!q!c!i!q#T#Z!q~!tR!Q![!}!c!i!}#T#Z!}~#QR!Q![!P!c!i!P#T#Z!P~#^R!Q![#g!c!i#g#T#Z#g~#jS!Q![#g!c!i#g#T#Z#g#q#r!P~#yP;=`<%l!P~$RO(^~~", 141, 335), new $n("j~RQYZXz{^~^O'{~~aP!P!Qd~iO'|~~", 25, 318)],
  topRules: { Script: [0, 7], SingleExpression: [1, 272], SingleClassItem: [2, 273] },
  dialects: { jsx: 0, ts: 14725 },
  dynamicPrecedences: { 77: 1, 79: 1, 91: 1, 167: 1, 196: 1 },
  specialized: [{ term: 322, get: (r) => Q1[r] || -1 }, { term: 338, get: (r) => w1[r] || -1 }, { term: 92, get: (r) => P1[r] || -1 }],
  tokenPrec: 14749
});
class wl {
  /**
  Create a new completion context. (Mostly useful for testing
  completion sources—in the editor, the extension will create
  these for you.)
  */
  constructor(e, t, i, n) {
    this.state = e, this.pos = t, this.explicit = i, this.view = n, this.abortListeners = [], this.abortOnDocChange = !1;
  }
  /**
  Get the extent, content, and (if there is a token) type of the
  token before `this.pos`.
  */
  tokenBefore(e) {
    let t = H(this.state).resolveInner(this.pos, -1);
    for (; t && e.indexOf(t.name) < 0; )
      t = t.parent;
    return t ? {
      from: t.from,
      to: this.pos,
      text: this.state.sliceDoc(t.from, this.pos),
      type: t.type
    } : null;
  }
  /**
  Get the match of the given expression directly before the
  cursor.
  */
  matchBefore(e) {
    let t = this.state.doc.lineAt(this.pos), i = Math.max(t.from, this.pos - 250), n = t.text.slice(i - t.from, this.pos - t.from), s = n.search(Vu(e, !1));
    return s < 0 ? null : { from: i + s, to: this.pos, text: n.slice(s) };
  }
  /**
  Yields true when the query has been aborted. Can be useful in
  asynchronous queries to avoid doing work that will be ignored.
  */
  get aborted() {
    return this.abortListeners == null;
  }
  /**
  Allows you to register abort handlers, which will be called when
  the query is
  [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
  
  By default, running queries will not be aborted for regular
  typing or backspacing, on the assumption that they are likely to
  return a result with a
  [`validFor`](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult.validFor) field that
  allows the result to be used after all. Passing `onDocChange:
  true` will cause this query to be aborted for any document
  change.
  */
  addEventListener(e, t, i) {
    e == "abort" && this.abortListeners && (this.abortListeners.push(t), i && i.onDocChange && (this.abortOnDocChange = !0));
  }
}
function Eh(r) {
  let e = Object.keys(r).join(""), t = /\w/.test(e);
  return t && (e = e.replace(/\w/g, "")), `[${t ? "\\w" : ""}${e.replace(/[^\w\s]/g, "\\$&")}]`;
}
function v1(r) {
  let e = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ Object.create(null);
  for (let { label: n } of r) {
    e[n[0]] = !0;
    for (let s = 1; s < n.length; s++)
      t[n[s]] = !0;
  }
  let i = Eh(e) + Eh(t) + "*$";
  return [new RegExp("^" + i), new RegExp(i)];
}
function qu(r) {
  let e = r.map((n) => typeof n == "string" ? { label: n } : n), [t, i] = e.every((n) => /^\w+$/.test(n.label)) ? [/\w*$/, /\w+$/] : v1(e);
  return (n) => {
    let s = n.matchBefore(i);
    return s || n.explicit ? { from: s ? s.from : n.pos, options: e, validFor: t } : null;
  };
}
function C1(r, e) {
  return (t) => {
    for (let i = H(t.state).resolveInner(t.pos, -1); i; i = i.parent) {
      if (r.indexOf(i.name) > -1)
        return null;
      if (i.type.isTop)
        break;
    }
    return e(t);
  };
}
class Wh {
  constructor(e, t, i, n) {
    this.completion = e, this.source = t, this.match = i, this.score = n;
  }
}
function Rt(r) {
  return r.selection.main.from;
}
function Vu(r, e) {
  var t;
  let { source: i } = r, n = e && i[0] != "^", s = i[i.length - 1] != "$";
  return !n && !s ? r : new RegExp(`${n ? "^" : ""}(?:${i})${s ? "$" : ""}`, (t = r.flags) !== null && t !== void 0 ? t : r.ignoreCase ? "i" : "");
}
const Pl = /* @__PURE__ */ kt.define();
function Z1(r, e, t, i) {
  let { main: n } = r.selection, s = t - n.from, o = i - n.from;
  return Object.assign(Object.assign({}, r.changeByRange((l) => l != n && t != i && r.sliceDoc(l.from + s, l.from + o) != r.sliceDoc(t, i) ? { range: l } : {
    changes: { from: l.from + s, to: i == n.from ? l.to : l.from + o, insert: e },
    range: y.cursor(l.from + s + e.length)
  })), { scrollIntoView: !0, userEvent: "input.complete" });
}
const Yh = /* @__PURE__ */ new WeakMap();
function T1(r) {
  if (!Array.isArray(r))
    return r;
  let e = Yh.get(r);
  return e || Yh.set(r, e = qu(r)), e;
}
const Nn = /* @__PURE__ */ M.define(), gr = /* @__PURE__ */ M.define();
class A1 {
  constructor(e) {
    this.pattern = e, this.chars = [], this.folded = [], this.any = [], this.precise = [], this.byWord = [], this.score = 0, this.matched = [];
    for (let t = 0; t < e.length; ) {
      let i = fe(e, t), n = Ve(i);
      this.chars.push(i);
      let s = e.slice(t, t + n), o = s.toUpperCase();
      this.folded.push(fe(o == s ? s.toLowerCase() : o, 0)), t += n;
    }
    this.astral = e.length != this.chars.length;
  }
  ret(e, t) {
    return this.score = e, this.matched = t, this;
  }
  // Matches a given word (completion) against the pattern (input).
  // Will return a boolean indicating whether there was a match and,
  // on success, set `this.score` to the score, `this.matched` to an
  // array of `from, to` pairs indicating the matched parts of `word`.
  //
  // The score is a number that is more negative the worse the match
  // is. See `Penalty` above.
  match(e) {
    if (this.pattern.length == 0)
      return this.ret(-100, []);
    if (e.length < this.pattern.length)
      return null;
    let { chars: t, folded: i, any: n, precise: s, byWord: o } = this;
    if (t.length == 1) {
      let S = fe(e, 0), k = Ve(S), Q = k == e.length ? 0 : -100;
      if (S != t[0]) if (S == i[0])
        Q += -200;
      else
        return null;
      return this.ret(Q, [0, k]);
    }
    let l = e.indexOf(this.pattern);
    if (l == 0)
      return this.ret(e.length == this.pattern.length ? 0 : -100, [0, this.pattern.length]);
    let a = t.length, h = 0;
    if (l < 0) {
      for (let S = 0, k = Math.min(e.length, 200); S < k && h < a; ) {
        let Q = fe(e, S);
        (Q == t[h] || Q == i[h]) && (n[h++] = S), S += Ve(Q);
      }
      if (h < a)
        return null;
    }
    let c = 0, f = 0, d = !1, O = 0, p = -1, m = -1, g = /[a-z]/.test(e), b = !0;
    for (let S = 0, k = Math.min(e.length, 200), Q = 0; S < k && f < a; ) {
      let x = fe(e, S);
      l < 0 && (c < a && x == t[c] && (s[c++] = S), O < a && (x == t[O] || x == i[O] ? (O == 0 && (p = S), m = S + 1, O++) : O = 0));
      let v, $ = x < 255 ? x >= 48 && x <= 57 || x >= 97 && x <= 122 ? 2 : x >= 65 && x <= 90 ? 1 : 0 : (v = sl(x)) != v.toLowerCase() ? 1 : v != v.toUpperCase() ? 2 : 0;
      (!S || $ == 1 && g || Q == 0 && $ != 0) && (t[f] == x || i[f] == x && (d = !0) ? o[f++] = S : o.length && (b = !1)), Q = $, S += Ve(x);
    }
    return f == a && o[0] == 0 && b ? this.result(-100 + (d ? -200 : 0), o, e) : O == a && p == 0 ? this.ret(-200 - e.length + (m == e.length ? 0 : -100), [0, m]) : l > -1 ? this.ret(-700 - e.length, [l, l + this.pattern.length]) : O == a ? this.ret(-900 - e.length, [p, m]) : f == a ? this.result(-100 + (d ? -200 : 0) + -700 + (b ? 0 : -1100), o, e) : t.length == 2 ? null : this.result((n[0] ? -700 : 0) + -200 + -1100, n, e);
  }
  result(e, t, i) {
    let n = [], s = 0;
    for (let o of t) {
      let l = o + (this.astral ? Ve(fe(i, o)) : 1);
      s && n[s - 1] == o ? n[s - 1] = l : (n[s++] = o, n[s++] = l);
    }
    return this.ret(e - i.length, n);
  }
}
class R1 {
  constructor(e) {
    this.pattern = e, this.matched = [], this.score = 0, this.folded = e.toLowerCase();
  }
  match(e) {
    if (e.length < this.pattern.length)
      return null;
    let t = e.slice(0, this.pattern.length), i = t == this.pattern ? 0 : t.toLowerCase() == this.folded ? -200 : null;
    return i == null ? null : (this.matched = [0, t.length], this.score = i + (e.length == this.pattern.length ? 0 : -100), this);
  }
}
const Oe = /* @__PURE__ */ T.define({
  combine(r) {
    return ut(r, {
      activateOnTyping: !0,
      activateOnCompletion: () => !1,
      activateOnTypingDelay: 100,
      selectOnOpen: !0,
      override: null,
      closeOnBlur: !0,
      maxRenderedOptions: 100,
      defaultKeymap: !0,
      tooltipClass: () => "",
      optionClass: () => "",
      aboveCursor: !1,
      icons: !0,
      addToOptions: [],
      positionInfo: X1,
      filterStrict: !1,
      compareCompletions: (e, t) => e.label.localeCompare(t.label),
      interactionDelay: 75,
      updateSyncTime: 100
    }, {
      defaultKeymap: (e, t) => e && t,
      closeOnBlur: (e, t) => e && t,
      icons: (e, t) => e && t,
      tooltipClass: (e, t) => (i) => Dh(e(i), t(i)),
      optionClass: (e, t) => (i) => Dh(e(i), t(i)),
      addToOptions: (e, t) => e.concat(t),
      filterStrict: (e, t) => e || t
    });
  }
});
function Dh(r, e) {
  return r ? e ? r + " " + e : r : e;
}
function X1(r, e, t, i, n, s) {
  let o = r.textDirection == J.RTL, l = o, a = !1, h = "top", c, f, d = e.left - n.left, O = n.right - e.right, p = i.right - i.left, m = i.bottom - i.top;
  if (l && d < Math.min(p, O) ? l = !1 : !l && O < Math.min(p, d) && (l = !0), p <= (l ? d : O))
    c = Math.max(n.top, Math.min(t.top, n.bottom - m)) - e.top, f = Math.min(400, l ? d : O);
  else {
    a = !0, f = Math.min(
      400,
      (o ? e.right : n.right - e.left) - 30
      /* Info.Margin */
    );
    let S = n.bottom - e.bottom;
    S >= m || S > e.top ? c = t.bottom - e.top : (h = "bottom", c = e.bottom - t.top);
  }
  let g = (e.bottom - e.top) / s.offsetHeight, b = (e.right - e.left) / s.offsetWidth;
  return {
    style: `${h}: ${c / g}px; max-width: ${f / b}px`,
    class: "cm-completionInfo-" + (a ? o ? "left-narrow" : "right-narrow" : l ? "left" : "right")
  };
}
function M1(r) {
  let e = r.addToOptions.slice();
  return r.icons && e.push({
    render(t) {
      let i = document.createElement("div");
      return i.classList.add("cm-completionIcon"), t.type && i.classList.add(...t.type.split(/\s+/g).map((n) => "cm-completionIcon-" + n)), i.setAttribute("aria-hidden", "true"), i;
    },
    position: 20
  }), e.push({
    render(t, i, n, s) {
      let o = document.createElement("span");
      o.className = "cm-completionLabel";
      let l = t.displayLabel || t.label, a = 0;
      for (let h = 0; h < s.length; ) {
        let c = s[h++], f = s[h++];
        c > a && o.appendChild(document.createTextNode(l.slice(a, c)));
        let d = o.appendChild(document.createElement("span"));
        d.appendChild(document.createTextNode(l.slice(c, f))), d.className = "cm-completionMatchedText", a = f;
      }
      return a < l.length && o.appendChild(document.createTextNode(l.slice(a))), o;
    },
    position: 50
  }, {
    render(t) {
      if (!t.detail)
        return null;
      let i = document.createElement("span");
      return i.className = "cm-completionDetail", i.textContent = t.detail, i;
    },
    position: 80
  }), e.sort((t, i) => t.position - i.position).map((t) => t.render);
}
function Es(r, e, t) {
  if (r <= t)
    return { from: 0, to: r };
  if (e < 0 && (e = 0), e <= r >> 1) {
    let n = Math.floor(e / t);
    return { from: n * t, to: (n + 1) * t };
  }
  let i = Math.floor((r - e) / t);
  return { from: r - (i + 1) * t, to: r - i * t };
}
class E1 {
  constructor(e, t, i) {
    this.view = e, this.stateField = t, this.applyCompletion = i, this.info = null, this.infoDestroy = null, this.placeInfoReq = {
      read: () => this.measureInfo(),
      write: (a) => this.placeInfo(a),
      key: this
    }, this.space = null, this.currentClass = "";
    let n = e.state.field(t), { options: s, selected: o } = n.open, l = e.state.facet(Oe);
    this.optionContent = M1(l), this.optionClass = l.optionClass, this.tooltipClass = l.tooltipClass, this.range = Es(s.length, o, l.maxRenderedOptions), this.dom = document.createElement("div"), this.dom.className = "cm-tooltip-autocomplete", this.updateTooltipClass(e.state), this.dom.addEventListener("mousedown", (a) => {
      let { options: h } = e.state.field(t).open;
      for (let c = a.target, f; c && c != this.dom; c = c.parentNode)
        if (c.nodeName == "LI" && (f = /-(\d+)$/.exec(c.id)) && +f[1] < h.length) {
          this.applyCompletion(e, h[+f[1]]), a.preventDefault();
          return;
        }
    }), this.dom.addEventListener("focusout", (a) => {
      let h = e.state.field(this.stateField, !1);
      h && h.tooltip && e.state.facet(Oe).closeOnBlur && a.relatedTarget != e.contentDOM && e.dispatch({ effects: gr.of(null) });
    }), this.showOptions(s, n.id);
  }
  mount() {
    this.updateSel();
  }
  showOptions(e, t) {
    this.list && this.list.remove(), this.list = this.dom.appendChild(this.createListBox(e, t, this.range)), this.list.addEventListener("scroll", () => {
      this.info && this.view.requestMeasure(this.placeInfoReq);
    });
  }
  update(e) {
    var t;
    let i = e.state.field(this.stateField), n = e.startState.field(this.stateField);
    if (this.updateTooltipClass(e.state), i != n) {
      let { options: s, selected: o, disabled: l } = i.open;
      (!n.open || n.open.options != s) && (this.range = Es(s.length, o, e.state.facet(Oe).maxRenderedOptions), this.showOptions(s, i.id)), this.updateSel(), l != ((t = n.open) === null || t === void 0 ? void 0 : t.disabled) && this.dom.classList.toggle("cm-tooltip-autocomplete-disabled", !!l);
    }
  }
  updateTooltipClass(e) {
    let t = this.tooltipClass(e);
    if (t != this.currentClass) {
      for (let i of this.currentClass.split(" "))
        i && this.dom.classList.remove(i);
      for (let i of t.split(" "))
        i && this.dom.classList.add(i);
      this.currentClass = t;
    }
  }
  positioned(e) {
    this.space = e, this.info && this.view.requestMeasure(this.placeInfoReq);
  }
  updateSel() {
    let e = this.view.state.field(this.stateField), t = e.open;
    if ((t.selected > -1 && t.selected < this.range.from || t.selected >= this.range.to) && (this.range = Es(t.options.length, t.selected, this.view.state.facet(Oe).maxRenderedOptions), this.showOptions(t.options, e.id)), this.updateSelectedOption(t.selected)) {
      this.destroyInfo();
      let { completion: i } = t.options[t.selected], { info: n } = i;
      if (!n)
        return;
      let s = typeof n == "string" ? document.createTextNode(n) : n(i);
      if (!s)
        return;
      "then" in s ? s.then((o) => {
        o && this.view.state.field(this.stateField, !1) == e && this.addInfoPane(o, i);
      }).catch((o) => Ce(this.view.state, o, "completion info")) : this.addInfoPane(s, i);
    }
  }
  addInfoPane(e, t) {
    this.destroyInfo();
    let i = this.info = document.createElement("div");
    if (i.className = "cm-tooltip cm-completionInfo", e.nodeType != null)
      i.appendChild(e), this.infoDestroy = null;
    else {
      let { dom: n, destroy: s } = e;
      i.appendChild(n), this.infoDestroy = s || null;
    }
    this.dom.appendChild(i), this.view.requestMeasure(this.placeInfoReq);
  }
  updateSelectedOption(e) {
    let t = null;
    for (let i = this.list.firstChild, n = this.range.from; i; i = i.nextSibling, n++)
      i.nodeName != "LI" || !i.id ? n-- : n == e ? i.hasAttribute("aria-selected") || (i.setAttribute("aria-selected", "true"), t = i) : i.hasAttribute("aria-selected") && i.removeAttribute("aria-selected");
    return t && Y1(this.list, t), t;
  }
  measureInfo() {
    let e = this.dom.querySelector("[aria-selected]");
    if (!e || !this.info)
      return null;
    let t = this.dom.getBoundingClientRect(), i = this.info.getBoundingClientRect(), n = e.getBoundingClientRect(), s = this.space;
    if (!s) {
      let o = this.dom.ownerDocument.defaultView || window;
      s = { left: 0, top: 0, right: o.innerWidth, bottom: o.innerHeight };
    }
    return n.top > Math.min(s.bottom, t.bottom) - 10 || n.bottom < Math.max(s.top, t.top) + 10 ? null : this.view.state.facet(Oe).positionInfo(this.view, t, n, i, s, this.dom);
  }
  placeInfo(e) {
    this.info && (e ? (e.style && (this.info.style.cssText = e.style), this.info.className = "cm-tooltip cm-completionInfo " + (e.class || "")) : this.info.style.cssText = "top: -1e6px");
  }
  createListBox(e, t, i) {
    const n = document.createElement("ul");
    n.id = t, n.setAttribute("role", "listbox"), n.setAttribute("aria-expanded", "true"), n.setAttribute("aria-label", this.view.state.phrase("Completions"));
    let s = null;
    for (let o = i.from; o < i.to; o++) {
      let { completion: l, match: a } = e[o], { section: h } = l;
      if (h) {
        let d = typeof h == "string" ? h : h.name;
        if (d != s && (o > i.from || i.from == 0))
          if (s = d, typeof h != "string" && h.header)
            n.appendChild(h.header(h));
          else {
            let O = n.appendChild(document.createElement("completion-section"));
            O.textContent = d;
          }
      }
      const c = n.appendChild(document.createElement("li"));
      c.id = t + "-" + o, c.setAttribute("role", "option");
      let f = this.optionClass(l);
      f && (c.className = f);
      for (let d of this.optionContent) {
        let O = d(l, this.view.state, this.view, a);
        O && c.appendChild(O);
      }
    }
    return i.from && n.classList.add("cm-completionListIncompleteTop"), i.to < e.length && n.classList.add("cm-completionListIncompleteBottom"), n;
  }
  destroyInfo() {
    this.info && (this.infoDestroy && this.infoDestroy(), this.info.remove(), this.info = null);
  }
  destroy() {
    this.destroyInfo();
  }
}
function W1(r, e) {
  return (t) => new E1(t, r, e);
}
function Y1(r, e) {
  let t = r.getBoundingClientRect(), i = e.getBoundingClientRect(), n = t.height / r.offsetHeight;
  i.top < t.top ? r.scrollTop -= (t.top - i.top) / n : i.bottom > t.bottom && (r.scrollTop += (i.bottom - t.bottom) / n);
}
function qh(r) {
  return (r.boost || 0) * 100 + (r.apply ? 10 : 0) + (r.info ? 5 : 0) + (r.type ? 1 : 0);
}
function D1(r, e) {
  let t = [], i = null, n = (h) => {
    t.push(h);
    let { section: c } = h.completion;
    if (c) {
      i || (i = []);
      let f = typeof c == "string" ? c : c.name;
      i.some((d) => d.name == f) || i.push(typeof c == "string" ? { name: f } : c);
    }
  }, s = e.facet(Oe);
  for (let h of r)
    if (h.hasResult()) {
      let c = h.result.getMatch;
      if (h.result.filter === !1)
        for (let f of h.result.options)
          n(new Wh(f, h.source, c ? c(f) : [], 1e9 - t.length));
      else {
        let f = e.sliceDoc(h.from, h.to), d, O = s.filterStrict ? new R1(f) : new A1(f);
        for (let p of h.result.options)
          if (d = O.match(p.label)) {
            let m = p.displayLabel ? c ? c(p, d.matched) : [] : d.matched;
            n(new Wh(p, h.source, m, d.score + (p.boost || 0)));
          }
      }
    }
  if (i) {
    let h = /* @__PURE__ */ Object.create(null), c = 0, f = (d, O) => {
      var p, m;
      return ((p = d.rank) !== null && p !== void 0 ? p : 1e9) - ((m = O.rank) !== null && m !== void 0 ? m : 1e9) || (d.name < O.name ? -1 : 1);
    };
    for (let d of i.sort(f))
      c -= 1e5, h[d.name] = c;
    for (let d of t) {
      let { section: O } = d.completion;
      O && (d.score += h[typeof O == "string" ? O : O.name]);
    }
  }
  let o = [], l = null, a = s.compareCompletions;
  for (let h of t.sort((c, f) => f.score - c.score || a(c.completion, f.completion))) {
    let c = h.completion;
    !l || l.label != c.label || l.detail != c.detail || l.type != null && c.type != null && l.type != c.type || l.apply != c.apply || l.boost != c.boost ? o.push(h) : qh(h.completion) > qh(l) && (o[o.length - 1] = h), l = h.completion;
  }
  return o;
}
class ci {
  constructor(e, t, i, n, s, o) {
    this.options = e, this.attrs = t, this.tooltip = i, this.timestamp = n, this.selected = s, this.disabled = o;
  }
  setSelected(e, t) {
    return e == this.selected || e >= this.options.length ? this : new ci(this.options, Vh(t, e), this.tooltip, this.timestamp, e, this.disabled);
  }
  static build(e, t, i, n, s) {
    let o = D1(e, t);
    if (!o.length)
      return n && e.some(
        (a) => a.state == 1
        /* State.Pending */
      ) ? new ci(n.options, n.attrs, n.tooltip, n.timestamp, n.selected, !0) : null;
    let l = t.facet(Oe).selectOnOpen ? 0 : -1;
    if (n && n.selected != l && n.selected != -1) {
      let a = n.options[n.selected].completion;
      for (let h = 0; h < o.length; h++)
        if (o[h].completion == a) {
          l = h;
          break;
        }
    }
    return new ci(o, Vh(i, l), {
      pos: e.reduce((a, h) => h.hasResult() ? Math.min(a, h.from) : a, 1e8),
      create: N1,
      above: s.aboveCursor
    }, n ? n.timestamp : Date.now(), l, !1);
  }
  map(e) {
    return new ci(this.options, this.attrs, Object.assign(Object.assign({}, this.tooltip), { pos: e.mapPos(this.tooltip.pos) }), this.timestamp, this.selected, this.disabled);
  }
}
class _n {
  constructor(e, t, i) {
    this.active = e, this.id = t, this.open = i;
  }
  static start() {
    return new _n(z1, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
  }
  update(e) {
    let { state: t } = e, i = t.facet(Oe), s = (i.override || t.languageDataAt("autocomplete", Rt(t)).map(T1)).map((l) => (this.active.find((h) => h.source == l) || new Ee(
      l,
      this.active.some(
        (h) => h.state != 0
        /* State.Inactive */
      ) ? 1 : 0
      /* State.Inactive */
    )).update(e, i));
    s.length == this.active.length && s.every((l, a) => l == this.active[a]) && (s = this.active);
    let o = this.open;
    o && e.docChanged && (o = o.map(e.changes)), e.selection || s.some((l) => l.hasResult() && e.changes.touchesRange(l.from, l.to)) || !q1(s, this.active) ? o = ci.build(s, t, this.id, o, i) : o && o.disabled && !s.some(
      (l) => l.state == 1
      /* State.Pending */
    ) && (o = null), !o && s.every(
      (l) => l.state != 1
      /* State.Pending */
    ) && s.some((l) => l.hasResult()) && (s = s.map((l) => l.hasResult() ? new Ee(
      l.source,
      0
      /* State.Inactive */
    ) : l));
    for (let l of e.effects)
      l.is(Lu) && (o = o && o.setSelected(l.value, this.id));
    return s == this.active && o == this.open ? this : new _n(s, this.id, o);
  }
  get tooltip() {
    return this.open ? this.open.tooltip : null;
  }
  get attrs() {
    return this.open ? this.open.attrs : this.active.length ? V1 : B1;
  }
}
function q1(r, e) {
  if (r == e)
    return !0;
  for (let t = 0, i = 0; ; ) {
    for (; t < r.length && !r[t].hasResult; )
      t++;
    for (; i < e.length && !e[i].hasResult; )
      i++;
    let n = t == r.length, s = i == e.length;
    if (n || s)
      return n == s;
    if (r[t++].result != e[i++].result)
      return !1;
  }
}
const V1 = {
  "aria-autocomplete": "list"
}, B1 = {};
function Vh(r, e) {
  let t = {
    "aria-autocomplete": "list",
    "aria-haspopup": "listbox",
    "aria-controls": r
  };
  return e > -1 && (t["aria-activedescendant"] = r + "-" + e), t;
}
const z1 = [];
function Bu(r, e) {
  if (r.isUserEvent("input.complete")) {
    let i = r.annotation(Pl);
    if (i && e.activateOnCompletion(i))
      return 12;
  }
  let t = r.isUserEvent("input.type");
  return t && e.activateOnTyping ? 5 : t ? 1 : r.isUserEvent("delete.backward") ? 2 : r.selection ? 8 : r.docChanged ? 16 : 0;
}
class Ee {
  constructor(e, t, i = -1) {
    this.source = e, this.state = t, this.explicitPos = i;
  }
  hasResult() {
    return !1;
  }
  update(e, t) {
    let i = Bu(e, t), n = this;
    (i & 8 || i & 16 && this.touches(e)) && (n = new Ee(
      n.source,
      0
      /* State.Inactive */
    )), i & 4 && n.state == 0 && (n = new Ee(
      this.source,
      1
      /* State.Pending */
    )), n = n.updateFor(e, i);
    for (let s of e.effects)
      if (s.is(Nn))
        n = new Ee(n.source, 1, s.value ? Rt(e.state) : -1);
      else if (s.is(gr))
        n = new Ee(
          n.source,
          0
          /* State.Inactive */
        );
      else if (s.is(zu))
        for (let o of s.value)
          o.source == n.source && (n = o);
    return n;
  }
  updateFor(e, t) {
    return this.map(e.changes);
  }
  map(e) {
    return e.empty || this.explicitPos < 0 ? this : new Ee(this.source, this.state, e.mapPos(this.explicitPos));
  }
  touches(e) {
    return e.changes.touchesRange(Rt(e.state));
  }
}
class gi extends Ee {
  constructor(e, t, i, n, s) {
    super(e, 2, t), this.result = i, this.from = n, this.to = s;
  }
  hasResult() {
    return !0;
  }
  updateFor(e, t) {
    var i;
    if (!(t & 3))
      return this.map(e.changes);
    let n = this.result;
    n.map && !e.changes.empty && (n = n.map(n, e.changes));
    let s = e.changes.mapPos(this.from), o = e.changes.mapPos(this.to, 1), l = Rt(e.state);
    if ((this.explicitPos < 0 ? l <= s : l < this.from) || l > o || !n || t & 2 && Rt(e.startState) == this.from)
      return new Ee(
        this.source,
        t & 4 ? 1 : 0
        /* State.Inactive */
      );
    let a = this.explicitPos < 0 ? -1 : e.changes.mapPos(this.explicitPos);
    return L1(n.validFor, e.state, s, o) ? new gi(this.source, a, n, s, o) : n.update && (n = n.update(n, s, o, new wl(e.state, l, a >= 0))) ? new gi(this.source, a, n, n.from, (i = n.to) !== null && i !== void 0 ? i : Rt(e.state)) : new Ee(this.source, 1, a);
  }
  map(e) {
    return e.empty ? this : (this.result.map ? this.result.map(this.result, e) : this.result) ? new gi(this.source, this.explicitPos < 0 ? -1 : e.mapPos(this.explicitPos), this.result, e.mapPos(this.from), e.mapPos(this.to, 1)) : new Ee(
      this.source,
      0
      /* State.Inactive */
    );
  }
  touches(e) {
    return e.changes.touchesRange(this.from, this.to);
  }
}
function L1(r, e, t, i) {
  if (!r)
    return !1;
  let n = e.sliceDoc(t, i);
  return typeof r == "function" ? r(n, t, i, e) : Vu(r, !0).test(n);
}
const zu = /* @__PURE__ */ M.define({
  map(r, e) {
    return r.map((t) => t.map(e));
  }
}), Lu = /* @__PURE__ */ M.define(), ve = /* @__PURE__ */ he.define({
  create() {
    return _n.start();
  },
  update(r, e) {
    return r.update(e);
  },
  provide: (r) => [
    bl.from(r, (e) => e.tooltip),
    C.contentAttributes.from(r, (e) => e.attrs)
  ]
});
function $l(r, e) {
  const t = e.completion.apply || e.completion.label;
  let i = r.state.field(ve).active.find((n) => n.source == e.source);
  return i instanceof gi ? (typeof t == "string" ? r.dispatch(Object.assign(Object.assign({}, Z1(r.state, t, i.from, i.to)), { annotations: Pl.of(e.completion) })) : t(r, e.completion, i.from, i.to), !0) : !1;
}
const N1 = /* @__PURE__ */ W1(ve, $l);
function rn(r, e = "option") {
  return (t) => {
    let i = t.state.field(ve, !1);
    if (!i || !i.open || i.open.disabled || Date.now() - i.open.timestamp < t.state.facet(Oe).interactionDelay)
      return !1;
    let n = 1, s;
    e == "page" && (s = mu(t, i.open.tooltip)) && (n = Math.max(2, Math.floor(s.dom.offsetHeight / s.dom.querySelector("li").offsetHeight) - 1));
    let { length: o } = i.open.options, l = i.open.selected > -1 ? i.open.selected + n * (r ? 1 : -1) : r ? 0 : o - 1;
    return l < 0 ? l = e == "page" ? 0 : o - 1 : l >= o && (l = e == "page" ? o - 1 : 0), t.dispatch({ effects: Lu.of(l) }), !0;
  };
}
const _1 = (r) => {
  let e = r.state.field(ve, !1);
  return r.state.readOnly || !e || !e.open || e.open.selected < 0 || e.open.disabled || Date.now() - e.open.timestamp < r.state.facet(Oe).interactionDelay ? !1 : $l(r, e.open.options[e.open.selected]);
}, U1 = (r) => r.state.field(ve, !1) ? (r.dispatch({ effects: Nn.of(!0) }), !0) : !1, I1 = (r) => {
  let e = r.state.field(ve, !1);
  return !e || !e.active.some(
    (t) => t.state != 0
    /* State.Inactive */
  ) ? !1 : (r.dispatch({ effects: gr.of(null) }), !0);
};
class j1 {
  constructor(e, t) {
    this.active = e, this.context = t, this.time = Date.now(), this.updates = [], this.done = void 0;
  }
}
const G1 = 50, F1 = 1e3, H1 = /* @__PURE__ */ se.fromClass(class {
  constructor(r) {
    this.view = r, this.debounceUpdate = -1, this.running = [], this.debounceAccept = -1, this.pendingStart = !1, this.composing = 0;
    for (let e of r.state.field(ve).active)
      e.state == 1 && this.startQuery(e);
  }
  update(r) {
    let e = r.state.field(ve), t = r.state.facet(Oe);
    if (!r.selectionSet && !r.docChanged && r.startState.field(ve) == e)
      return;
    let i = r.transactions.some((s) => {
      let o = Bu(s, t);
      return o & 8 || (s.selection || s.docChanged) && !(o & 3);
    });
    for (let s = 0; s < this.running.length; s++) {
      let o = this.running[s];
      if (i || o.context.abortOnDocChange && r.docChanged || o.updates.length + r.transactions.length > G1 && Date.now() - o.time > F1) {
        for (let l of o.context.abortListeners)
          try {
            l();
          } catch (a) {
            Ce(this.view.state, a);
          }
        o.context.abortListeners = null, this.running.splice(s--, 1);
      } else
        o.updates.push(...r.transactions);
    }
    this.debounceUpdate > -1 && clearTimeout(this.debounceUpdate), r.transactions.some((s) => s.effects.some((o) => o.is(Nn))) && (this.pendingStart = !0);
    let n = this.pendingStart ? 50 : t.activateOnTypingDelay;
    if (this.debounceUpdate = e.active.some((s) => s.state == 1 && !this.running.some((o) => o.active.source == s.source)) ? setTimeout(() => this.startUpdate(), n) : -1, this.composing != 0)
      for (let s of r.transactions)
        s.isUserEvent("input.type") ? this.composing = 2 : this.composing == 2 && s.selection && (this.composing = 3);
  }
  startUpdate() {
    this.debounceUpdate = -1, this.pendingStart = !1;
    let { state: r } = this.view, e = r.field(ve);
    for (let t of e.active)
      t.state == 1 && !this.running.some((i) => i.active.source == t.source) && this.startQuery(t);
  }
  startQuery(r) {
    let { state: e } = this.view, t = Rt(e), i = new wl(e, t, r.explicitPos == t, this.view), n = new j1(r, i);
    this.running.push(n), Promise.resolve(r.source(i)).then((s) => {
      n.context.aborted || (n.done = s || null, this.scheduleAccept());
    }, (s) => {
      this.view.dispatch({ effects: gr.of(null) }), Ce(this.view.state, s);
    });
  }
  scheduleAccept() {
    this.running.every((r) => r.done !== void 0) ? this.accept() : this.debounceAccept < 0 && (this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(Oe).updateSyncTime));
  }
  // For each finished query in this.running, try to create a result
  // or, if appropriate, restart the query.
  accept() {
    var r;
    this.debounceAccept > -1 && clearTimeout(this.debounceAccept), this.debounceAccept = -1;
    let e = [], t = this.view.state.facet(Oe);
    for (let i = 0; i < this.running.length; i++) {
      let n = this.running[i];
      if (n.done === void 0)
        continue;
      if (this.running.splice(i--, 1), n.done) {
        let o = new gi(n.active.source, n.active.explicitPos, n.done, n.done.from, (r = n.done.to) !== null && r !== void 0 ? r : Rt(n.updates.length ? n.updates[0].startState : this.view.state));
        for (let l of n.updates)
          o = o.update(l, t);
        if (o.hasResult()) {
          e.push(o);
          continue;
        }
      }
      let s = this.view.state.field(ve).active.find((o) => o.source == n.active.source);
      if (s && s.state == 1)
        if (n.done == null) {
          let o = new Ee(
            n.active.source,
            0
            /* State.Inactive */
          );
          for (let l of n.updates)
            o = o.update(l, t);
          o.state != 1 && e.push(o);
        } else
          this.startQuery(s);
    }
    e.length && this.view.dispatch({ effects: zu.of(e) });
  }
}, {
  eventHandlers: {
    blur(r) {
      let e = this.view.state.field(ve, !1);
      if (e && e.tooltip && this.view.state.facet(Oe).closeOnBlur) {
        let t = e.open && mu(this.view, e.open.tooltip);
        (!t || !t.dom.contains(r.relatedTarget)) && setTimeout(() => this.view.dispatch({ effects: gr.of(null) }), 10);
      }
    },
    compositionstart() {
      this.composing = 1;
    },
    compositionend() {
      this.composing == 3 && setTimeout(() => this.view.dispatch({ effects: Nn.of(!1) }), 20), this.composing = 0;
    }
  }
}), K1 = typeof navigator == "object" && /* @__PURE__ */ /Win/.test(navigator.platform), J1 = /* @__PURE__ */ xt.highest(/* @__PURE__ */ C.domEventHandlers({
  keydown(r, e) {
    let t = e.state.field(ve, !1);
    if (!t || !t.open || t.open.disabled || t.open.selected < 0 || r.key.length > 1 || r.ctrlKey && !(K1 && r.altKey) || r.metaKey)
      return !1;
    let i = t.open.options[t.open.selected], n = t.active.find((o) => o.source == i.source), s = i.completion.commitCharacters || n.result.commitCharacters;
    return s && s.indexOf(r.key) > -1 && $l(e, i), !1;
  }
})), Nu = /* @__PURE__ */ C.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      height: "100%",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li, & > completion-section": {
        padding: "1px 3px",
        lineHeight: 1.2
      },
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer"
      },
      "& > completion-section": {
        display: "list-item",
        borderBottom: "1px solid silver",
        paddingLeft: "0.5em",
        opacity: 0.7
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#777"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#444"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"···"',
    opacity: 0.5,
    display: "block",
    textAlign: "center"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "400px",
    boxSizing: "border-box",
    whiteSpace: "pre-line"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  ".cm-completionInfo.cm-completionInfo-left-narrow": { right: "30px" },
  ".cm-completionInfo.cm-completionInfo-right-narrow": { left: "30px" },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    display: "inline-block",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6",
    boxSizing: "content-box"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'ƒ'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'○'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'◌'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'𝑥'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'𝐶'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'𝑡'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'∪'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'□'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'🔑︎'" }
    // Disable emoji rendering
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'▢'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
});
class eS {
  constructor(e, t, i, n) {
    this.field = e, this.line = t, this.from = i, this.to = n;
  }
}
class vl {
  constructor(e, t, i) {
    this.field = e, this.from = t, this.to = i;
  }
  map(e) {
    let t = e.mapPos(this.from, -1, de.TrackDel), i = e.mapPos(this.to, 1, de.TrackDel);
    return t == null || i == null ? null : new vl(this.field, t, i);
  }
}
class Cl {
  constructor(e, t) {
    this.lines = e, this.fieldPositions = t;
  }
  instantiate(e, t) {
    let i = [], n = [t], s = e.doc.lineAt(t), o = /^\s*/.exec(s.text)[0];
    for (let a of this.lines) {
      if (i.length) {
        let h = o, c = /^\t*/.exec(a)[0].length;
        for (let f = 0; f < c; f++)
          h += e.facet(Rr);
        n.push(t + h.length - c), a = h + a.slice(c);
      }
      i.push(a), t += a.length + 1;
    }
    let l = this.fieldPositions.map((a) => new vl(a.field, n[a.line] + a.from, n[a.line] + a.to));
    return { text: i, ranges: l };
  }
  static parse(e) {
    let t = [], i = [], n = [], s;
    for (let o of e.split(/\r\n?|\n/)) {
      for (; s = /[#$]\{(?:(\d+)(?::([^}]*))?|((?:\\[{}]|[^}])*))\}/.exec(o); ) {
        let l = s[1] ? +s[1] : null, a = s[2] || s[3] || "", h = -1, c = a.replace(/\\[{}]/g, (f) => f[1]);
        for (let f = 0; f < t.length; f++)
          (l != null ? t[f].seq == l : c && t[f].name == c) && (h = f);
        if (h < 0) {
          let f = 0;
          for (; f < t.length && (l == null || t[f].seq != null && t[f].seq < l); )
            f++;
          t.splice(f, 0, { seq: l, name: c }), h = f;
          for (let d of n)
            d.field >= h && d.field++;
        }
        n.push(new eS(h, i.length, s.index, s.index + c.length)), o = o.slice(0, s.index) + a + o.slice(s.index + s[0].length);
      }
      o = o.replace(/\\([{}])/g, (l, a, h) => {
        for (let c of n)
          c.line == i.length && c.from > h && (c.from--, c.to--);
        return a;
      }), i.push(o);
    }
    return new Cl(i, n);
  }
}
let tS = /* @__PURE__ */ R.widget({ widget: /* @__PURE__ */ new class extends Qt {
  toDOM() {
    let r = document.createElement("span");
    return r.className = "cm-snippetFieldPosition", r;
  }
  ignoreEvent() {
    return !1;
  }
}() }), iS = /* @__PURE__ */ R.mark({ class: "cm-snippetField" });
class Ai {
  constructor(e, t) {
    this.ranges = e, this.active = t, this.deco = R.set(e.map((i) => (i.from == i.to ? tS : iS).range(i.from, i.to)));
  }
  map(e) {
    let t = [];
    for (let i of this.ranges) {
      let n = i.map(e);
      if (!n)
        return null;
      t.push(n);
    }
    return new Ai(t, this.active);
  }
  selectionInsideField(e) {
    return e.ranges.every((t) => this.ranges.some((i) => i.field == this.active && i.from <= t.from && i.to >= t.to));
  }
}
const Er = /* @__PURE__ */ M.define({
  map(r, e) {
    return r && r.map(e);
  }
}), rS = /* @__PURE__ */ M.define(), br = /* @__PURE__ */ he.define({
  create() {
    return null;
  },
  update(r, e) {
    for (let t of e.effects) {
      if (t.is(Er))
        return t.value;
      if (t.is(rS) && r)
        return new Ai(r.ranges, t.value);
    }
    return r && e.docChanged && (r = r.map(e.changes)), r && e.selection && !r.selectionInsideField(e.selection) && (r = null), r;
  },
  provide: (r) => C.decorations.from(r, (e) => e ? e.deco : R.none)
});
function Zl(r, e) {
  return y.create(r.filter((t) => t.field == e).map((t) => y.range(t.from, t.to)));
}
function nS(r) {
  let e = Cl.parse(r);
  return (t, i, n, s) => {
    let { text: o, ranges: l } = e.instantiate(t.state, n), a = {
      changes: { from: n, to: s, insert: L.of(o) },
      scrollIntoView: !0,
      annotations: i ? [Pl.of(i), ne.userEvent.of("input.complete")] : void 0
    };
    if (l.length && (a.selection = Zl(l, 0)), l.some((h) => h.field > 0)) {
      let h = new Ai(l, 0), c = a.effects = [Er.of(h)];
      t.state.field(br, !1) === void 0 && c.push(M.appendConfig.of([br, hS, cS, Nu]));
    }
    t.dispatch(t.state.update(a));
  };
}
function _u(r) {
  return ({ state: e, dispatch: t }) => {
    let i = e.field(br, !1);
    if (!i || r < 0 && i.active == 0)
      return !1;
    let n = i.active + r, s = r > 0 && !i.ranges.some((o) => o.field == n + r);
    return t(e.update({
      selection: Zl(i.ranges, n),
      effects: Er.of(s ? null : new Ai(i.ranges, n)),
      scrollIntoView: !0
    })), !0;
  };
}
const sS = ({ state: r, dispatch: e }) => r.field(br, !1) ? (e(r.update({ effects: Er.of(null) })), !0) : !1, oS = /* @__PURE__ */ _u(1), lS = /* @__PURE__ */ _u(-1), aS = [
  { key: "Tab", run: oS, shift: lS },
  { key: "Escape", run: sS }
], Bh = /* @__PURE__ */ T.define({
  combine(r) {
    return r.length ? r[0] : aS;
  }
}), hS = /* @__PURE__ */ xt.highest(/* @__PURE__ */ Tr.compute([Bh], (r) => r.facet(Bh)));
function Pe(r, e) {
  return Object.assign(Object.assign({}, e), { apply: nS(r) });
}
const cS = /* @__PURE__ */ C.domEventHandlers({
  mousedown(r, e) {
    let t = e.state.field(br, !1), i;
    if (!t || (i = e.posAtCoords({ x: r.clientX, y: r.clientY })) == null)
      return !1;
    let n = t.ranges.find((s) => s.from <= i && s.to >= i);
    return !n || n.field == t.active ? !1 : (e.dispatch({
      selection: Zl(t.ranges, n.field),
      effects: Er.of(t.ranges.some((s) => s.field > n.field) ? new Ai(t.ranges, n.field) : null),
      scrollIntoView: !0
    }), !0);
  }
}), Sr = {
  brackets: ["(", "[", "{", "'", '"'],
  before: ")]}:;>",
  stringPrefixes: []
}, It = /* @__PURE__ */ M.define({
  map(r, e) {
    let t = e.mapPos(r, -1, de.TrackAfter);
    return t ?? void 0;
  }
}), Tl = /* @__PURE__ */ new class extends Ft {
}();
Tl.startSide = 1;
Tl.endSide = -1;
const Uu = /* @__PURE__ */ he.define({
  create() {
    return z.empty;
  },
  update(r, e) {
    if (r = r.map(e.changes), e.selection) {
      let t = e.state.doc.lineAt(e.selection.main.head);
      r = r.update({ filter: (i) => i >= t.from && i <= t.to });
    }
    for (let t of e.effects)
      t.is(It) && (r = r.update({ add: [Tl.range(t.value, t.value + 1)] }));
    return r;
  }
});
function fS() {
  return [dS, Uu];
}
const Ws = "()[]{}<>";
function Iu(r) {
  for (let e = 0; e < Ws.length; e += 2)
    if (Ws.charCodeAt(e) == r)
      return Ws.charAt(e + 1);
  return sl(r < 128 ? r : r + 1);
}
function ju(r, e) {
  return r.languageDataAt("closeBrackets", e)[0] || Sr;
}
const uS = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), dS = /* @__PURE__ */ C.inputHandler.of((r, e, t, i) => {
  if ((uS ? r.composing : r.compositionStarted) || r.state.readOnly)
    return !1;
  let n = r.state.selection.main;
  if (i.length > 2 || i.length == 2 && Ve(fe(i, 0)) == 1 || e != n.from || t != n.to)
    return !1;
  let s = mS(r.state, i);
  return s ? (r.dispatch(s), !0) : !1;
}), OS = ({ state: r, dispatch: e }) => {
  if (r.readOnly)
    return !1;
  let i = ju(r, r.selection.main.head).brackets || Sr.brackets, n = null, s = r.changeByRange((o) => {
    if (o.empty) {
      let l = gS(r.doc, o.head);
      for (let a of i)
        if (a == l && ns(r.doc, o.head) == Iu(fe(a, 0)))
          return {
            changes: { from: o.head - a.length, to: o.head + a.length },
            range: y.cursor(o.head - a.length)
          };
    }
    return { range: n = o };
  });
  return n || e(r.update(s, { scrollIntoView: !0, userEvent: "delete.backward" })), !n;
}, pS = [
  { key: "Backspace", run: OS }
];
function mS(r, e) {
  let t = ju(r, r.selection.main.head), i = t.brackets || Sr.brackets;
  for (let n of i) {
    let s = Iu(fe(n, 0));
    if (e == n)
      return s == n ? yS(r, n, i.indexOf(n + n + n) > -1, t) : bS(r, n, s, t.before || Sr.before);
    if (e == s && Gu(r, r.selection.main.from))
      return SS(r, n, s);
  }
  return null;
}
function Gu(r, e) {
  let t = !1;
  return r.field(Uu).between(0, r.doc.length, (i) => {
    i == e && (t = !0);
  }), t;
}
function ns(r, e) {
  let t = r.sliceString(e, e + 2);
  return t.slice(0, Ve(fe(t, 0)));
}
function gS(r, e) {
  let t = r.sliceString(e - 2, e);
  return Ve(fe(t, 0)) == t.length ? t : t.slice(1);
}
function bS(r, e, t, i) {
  let n = null, s = r.changeByRange((o) => {
    if (!o.empty)
      return {
        changes: [{ insert: e, from: o.from }, { insert: t, from: o.to }],
        effects: It.of(o.to + e.length),
        range: y.range(o.anchor + e.length, o.head + e.length)
      };
    let l = ns(r.doc, o.head);
    return !l || /\s/.test(l) || i.indexOf(l) > -1 ? {
      changes: { insert: e + t, from: o.head },
      effects: It.of(o.head + e.length),
      range: y.cursor(o.head + e.length)
    } : { range: n = o };
  });
  return n ? null : r.update(s, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function SS(r, e, t) {
  let i = null, n = r.changeByRange((s) => s.empty && ns(r.doc, s.head) == t ? {
    changes: { from: s.head, to: s.head + t.length, insert: t },
    range: y.cursor(s.head + t.length)
  } : i = { range: s });
  return i ? null : r.update(n, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function yS(r, e, t, i) {
  let n = i.stringPrefixes || Sr.stringPrefixes, s = null, o = r.changeByRange((l) => {
    if (!l.empty)
      return {
        changes: [{ insert: e, from: l.from }, { insert: e, from: l.to }],
        effects: It.of(l.to + e.length),
        range: y.range(l.anchor + e.length, l.head + e.length)
      };
    let a = l.head, h = ns(r.doc, a), c;
    if (h == e) {
      if (zh(r, a))
        return {
          changes: { insert: e + e, from: a },
          effects: It.of(a + e.length),
          range: y.cursor(a + e.length)
        };
      if (Gu(r, a)) {
        let d = t && r.sliceDoc(a, a + e.length * 3) == e + e + e ? e + e + e : e;
        return {
          changes: { from: a, to: a + d.length, insert: d },
          range: y.cursor(a + d.length)
        };
      }
    } else {
      if (t && r.sliceDoc(a - 2 * e.length, a) == e + e && (c = Lh(r, a - 2 * e.length, n)) > -1 && zh(r, c))
        return {
          changes: { insert: e + e + e + e, from: a },
          effects: It.of(a + e.length),
          range: y.cursor(a + e.length)
        };
      if (r.charCategorizer(a)(h) != ee.Word && Lh(r, a, n) > -1 && !xS(r, a, e, n))
        return {
          changes: { insert: e + e, from: a },
          effects: It.of(a + e.length),
          range: y.cursor(a + e.length)
        };
    }
    return { range: s = l };
  });
  return s ? null : r.update(o, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function zh(r, e) {
  let t = H(r).resolveInner(e + 1);
  return t.parent && t.from == e;
}
function xS(r, e, t, i) {
  let n = H(r).resolveInner(e, -1), s = i.reduce((o, l) => Math.max(o, l.length), 0);
  for (let o = 0; o < 5; o++) {
    let l = r.sliceDoc(n.from, Math.min(n.to, n.from + t.length + s)), a = l.indexOf(t);
    if (!a || a > -1 && i.indexOf(l.slice(0, a)) > -1) {
      let c = n.firstChild;
      for (; c && c.from == n.from && c.to - c.from > t.length + a; ) {
        if (r.sliceDoc(c.to - t.length, c.to) == t)
          return !1;
        c = c.firstChild;
      }
      return !0;
    }
    let h = n.to == e && n.parent;
    if (!h)
      break;
    n = h;
  }
  return !1;
}
function Lh(r, e, t) {
  let i = r.charCategorizer(e);
  if (i(r.sliceDoc(e - 1, e)) != ee.Word)
    return e;
  for (let n of t) {
    let s = e - n.length;
    if (r.sliceDoc(s, e) == n && i(r.sliceDoc(s - 1, s)) != ee.Word)
      return s;
  }
  return -1;
}
function kS(r = {}) {
  return [
    J1,
    ve,
    Oe.of(r),
    H1,
    QS,
    Nu
  ];
}
const Fu = [
  { key: "Ctrl-Space", run: U1 },
  { key: "Escape", run: I1 },
  { key: "ArrowDown", run: /* @__PURE__ */ rn(!0) },
  { key: "ArrowUp", run: /* @__PURE__ */ rn(!1) },
  { key: "PageDown", run: /* @__PURE__ */ rn(!0, "page") },
  { key: "PageUp", run: /* @__PURE__ */ rn(!1, "page") },
  { key: "Enter", run: _1 }
], QS = /* @__PURE__ */ xt.highest(/* @__PURE__ */ Tr.computeN([Oe], (r) => r.facet(Oe).defaultKeymap ? [Fu] : [])), Hu = [
  /* @__PURE__ */ Pe("function ${name}(${params}) {\n	${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n	${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe("for (let ${name} of ${collection}) {\n	${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe("do {\n	${}\n} while (${})", {
    label: "do",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe("while (${}) {\n	${}\n}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe(`try {
	\${}
} catch (\${error}) {
	\${}
}`, {
    label: "try",
    detail: "/ catch block",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe("if (${}) {\n	${}\n}", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe(`if (\${}) {
	\${}
} else {
	\${}
}`, {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe(`class \${name} {
	constructor(\${params}) {
		\${}
	}
}`, {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe('import {${names}} from "${module}"\n${}', {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe('import ${name} from "${module}"\n${}', {
    label: "import",
    detail: "default",
    type: "keyword"
  })
], wS = /* @__PURE__ */ Hu.concat([
  /* @__PURE__ */ Pe("interface ${name} {\n	${}\n}", {
    label: "interface",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe("type ${name} = ${type}", {
    label: "type",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ Pe("enum ${name} {\n	${}\n}", {
    label: "enum",
    detail: "definition",
    type: "keyword"
  })
]), Nh = /* @__PURE__ */ new Cc(), Ku = /* @__PURE__ */ new Set([
  "Script",
  "Block",
  "FunctionExpression",
  "FunctionDeclaration",
  "ArrowFunction",
  "MethodDeclaration",
  "ForStatement"
]);
function qi(r) {
  return (e, t) => {
    let i = e.node.getChild("VariableDefinition");
    return i && t(i, r), !0;
  };
}
const PS = ["FunctionDeclaration"], $S = {
  FunctionDeclaration: /* @__PURE__ */ qi("function"),
  ClassDeclaration: /* @__PURE__ */ qi("class"),
  ClassExpression: () => !0,
  EnumDeclaration: /* @__PURE__ */ qi("constant"),
  TypeAliasDeclaration: /* @__PURE__ */ qi("type"),
  NamespaceDeclaration: /* @__PURE__ */ qi("namespace"),
  VariableDefinition(r, e) {
    r.matchContext(PS) || e(r, "variable");
  },
  TypeDefinition(r, e) {
    e(r, "type");
  },
  __proto__: null
};
function Ju(r, e) {
  let t = Nh.get(e);
  if (t)
    return t;
  let i = [], n = !0;
  function s(o, l) {
    let a = r.sliceString(o.from, o.to);
    i.push({ label: a, type: l });
  }
  return e.cursor(F.IncludeAnonymous).iterate((o) => {
    if (n)
      n = !1;
    else if (o.name) {
      let l = $S[o.name];
      if (l && l(o, s) || Ku.has(o.name))
        return !1;
    } else if (o.to - o.from > 8192) {
      for (let l of Ju(r, o.node))
        i.push(l);
      return !1;
    }
  }), Nh.set(e, i), i;
}
const _h = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/, ed = [
  "TemplateString",
  "String",
  "RegExp",
  "LineComment",
  "BlockComment",
  "VariableDefinition",
  "TypeDefinition",
  "Label",
  "PropertyDefinition",
  "PropertyName",
  "PrivatePropertyDefinition",
  "PrivatePropertyName",
  ".",
  "?."
];
function vS(r) {
  let e = H(r.state).resolveInner(r.pos, -1);
  if (ed.indexOf(e.name) > -1)
    return null;
  let t = e.name == "VariableName" || e.to - e.from < 20 && _h.test(r.state.sliceDoc(e.from, e.to));
  if (!t && !r.explicit)
    return null;
  let i = [];
  for (let n = e; n; n = n.parent)
    Ku.has(n.name) && (i = i.concat(Ju(r.state.doc, n)));
  return {
    options: i,
    from: t ? e.from : r.pos,
    validFor: _h
  };
}
const ft = /* @__PURE__ */ ei.define({
  name: "javascript",
  parser: /* @__PURE__ */ $1.configure({
    props: [
      /* @__PURE__ */ Ti.add({
        IfStatement: /* @__PURE__ */ mi({ except: /^\s*({|else\b)/ }),
        TryStatement: /* @__PURE__ */ mi({ except: /^\s*({|catch\b|finally\b)/ }),
        LabeledStatement: Ob,
        SwitchBody: (r) => {
          let e = r.textAfter, t = /^\s*\}/.test(e), i = /^\s*(case|default)\b/.test(e);
          return r.baseIndent + (t ? 0 : i ? 1 : 2) * r.unit;
        },
        Block: /* @__PURE__ */ db({ closing: "}" }),
        ArrowFunction: (r) => r.baseIndent + r.unit,
        "TemplateString BlockComment": () => null,
        "Statement Property": /* @__PURE__ */ mi({ except: /^{/ }),
        JSXElement(r) {
          let e = /^\s*<\//.test(r.textAfter);
          return r.lineIndent(r.node.from) + (e ? 0 : r.unit);
        },
        JSXEscape(r) {
          let e = /\s*\}/.test(r.textAfter);
          return r.lineIndent(r.node.from) + (e ? 0 : r.unit);
        },
        "JSXOpenTag JSXSelfClosingTag"(r) {
          return r.column(r.node.from) + r.unit;
        }
      }),
      /* @__PURE__ */ ri.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression ObjectType": Ql,
        BlockComment(r) {
          return { from: r.from + 2, to: r.to - 2 };
        }
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
}), td = {
  test: (r) => /^JSX/.test(r.name),
  facet: /* @__PURE__ */ Sl({ commentTokens: { block: { open: "{/*", close: "*/}" } } })
}, id = /* @__PURE__ */ ft.configure({ dialect: "ts" }, "typescript"), rd = /* @__PURE__ */ ft.configure({
  dialect: "jsx",
  props: [/* @__PURE__ */ yl.add((r) => r.isTop ? [td] : void 0)]
}), nd = /* @__PURE__ */ ft.configure({
  dialect: "jsx ts",
  props: [/* @__PURE__ */ yl.add((r) => r.isTop ? [td] : void 0)]
}, "typescript");
let sd = (r) => ({ label: r, type: "keyword" });
const od = /* @__PURE__ */ "break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map(sd), CS = /* @__PURE__ */ od.concat(/* @__PURE__ */ ["declare", "implements", "private", "protected", "public"].map(sd));
function Al(r = {}) {
  let e = r.jsx ? r.typescript ? nd : rd : r.typescript ? id : ft, t = r.typescript ? wS.concat(CS) : Hu.concat(od);
  return new wi(e, [
    ft.data.of({
      autocomplete: C1(ed, qu(t))
    }),
    ft.data.of({
      autocomplete: vS
    }),
    r.jsx ? AS : []
  ]);
}
function ZS(r) {
  for (; ; ) {
    if (r.name == "JSXOpenTag" || r.name == "JSXSelfClosingTag" || r.name == "JSXFragmentTag")
      return r;
    if (r.name == "JSXEscape" || !r.parent)
      return null;
    r = r.parent;
  }
}
function Uh(r, e, t = r.length) {
  for (let i = e == null ? void 0 : e.firstChild; i; i = i.nextSibling)
    if (i.name == "JSXIdentifier" || i.name == "JSXBuiltin" || i.name == "JSXNamespacedName" || i.name == "JSXMemberExpression")
      return r.sliceString(i.from, Math.min(i.to, t));
  return "";
}
const TS = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), AS = /* @__PURE__ */ C.inputHandler.of((r, e, t, i, n) => {
  if ((TS ? r.composing : r.compositionStarted) || r.state.readOnly || e != t || i != ">" && i != "/" || !ft.isActiveAt(r.state, e, -1))
    return !1;
  let s = n(), { state: o } = s, l = o.changeByRange((a) => {
    var h;
    let { head: c } = a, f = H(o).resolveInner(c - 1, -1), d;
    if (f.name == "JSXStartTag" && (f = f.parent), !(o.doc.sliceString(c - 1, c) != i || f.name == "JSXAttributeValue" && f.to > c)) {
      if (i == ">" && f.name == "JSXFragmentTag")
        return { range: a, changes: { from: c, insert: "</>" } };
      if (i == "/" && f.name == "JSXStartCloseTag") {
        let O = f.parent, p = O.parent;
        if (p && O.from == c - 2 && ((d = Uh(o.doc, p.firstChild, c)) || ((h = p.firstChild) === null || h === void 0 ? void 0 : h.name) == "JSXFragmentTag")) {
          let m = `${d}>`;
          return { range: y.cursor(c + m.length, -1), changes: { from: c, insert: m } };
        }
      } else if (i == ">") {
        let O = ZS(f);
        if (O && O.name == "JSXOpenTag" && !/^\/?>|^<\//.test(o.doc.sliceString(c, c + 2)) && (d = Uh(o.doc, O, c)))
          return { range: a, changes: { from: c, insert: `</${d}>` } };
      }
    }
    return { range: a };
  });
  return l.changes.empty ? !1 : (r.dispatch([
    s,
    o.update(l, { userEvent: "input.complete", scrollIntoView: !0 })
  ]), !0);
}), Vi = ["_blank", "_self", "_top", "_parent"], Ys = ["ascii", "utf-8", "utf-16", "latin1", "latin1"], Ds = ["get", "post", "put", "delete"], qs = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], Re = ["true", "false"], A = {}, RS = {
  a: {
    attrs: {
      href: null,
      ping: null,
      type: null,
      media: null,
      target: Vi,
      hreflang: null
    }
  },
  abbr: A,
  address: A,
  area: {
    attrs: {
      alt: null,
      coords: null,
      href: null,
      target: null,
      ping: null,
      media: null,
      hreflang: null,
      type: null,
      shape: ["default", "rect", "circle", "poly"]
    }
  },
  article: A,
  aside: A,
  audio: {
    attrs: {
      src: null,
      mediagroup: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["none", "metadata", "auto"],
      autoplay: ["autoplay"],
      loop: ["loop"],
      controls: ["controls"]
    }
  },
  b: A,
  base: { attrs: { href: null, target: Vi } },
  bdi: A,
  bdo: A,
  blockquote: { attrs: { cite: null } },
  body: A,
  br: A,
  button: {
    attrs: {
      form: null,
      formaction: null,
      name: null,
      value: null,
      autofocus: ["autofocus"],
      disabled: ["autofocus"],
      formenctype: qs,
      formmethod: Ds,
      formnovalidate: ["novalidate"],
      formtarget: Vi,
      type: ["submit", "reset", "button"]
    }
  },
  canvas: { attrs: { width: null, height: null } },
  caption: A,
  center: A,
  cite: A,
  code: A,
  col: { attrs: { span: null } },
  colgroup: { attrs: { span: null } },
  command: {
    attrs: {
      type: ["command", "checkbox", "radio"],
      label: null,
      icon: null,
      radiogroup: null,
      command: null,
      title: null,
      disabled: ["disabled"],
      checked: ["checked"]
    }
  },
  data: { attrs: { value: null } },
  datagrid: { attrs: { disabled: ["disabled"], multiple: ["multiple"] } },
  datalist: { attrs: { data: null } },
  dd: A,
  del: { attrs: { cite: null, datetime: null } },
  details: { attrs: { open: ["open"] } },
  dfn: A,
  div: A,
  dl: A,
  dt: A,
  em: A,
  embed: { attrs: { src: null, type: null, width: null, height: null } },
  eventsource: { attrs: { src: null } },
  fieldset: { attrs: { disabled: ["disabled"], form: null, name: null } },
  figcaption: A,
  figure: A,
  footer: A,
  form: {
    attrs: {
      action: null,
      name: null,
      "accept-charset": Ys,
      autocomplete: ["on", "off"],
      enctype: qs,
      method: Ds,
      novalidate: ["novalidate"],
      target: Vi
    }
  },
  h1: A,
  h2: A,
  h3: A,
  h4: A,
  h5: A,
  h6: A,
  head: {
    children: ["title", "base", "link", "style", "meta", "script", "noscript", "command"]
  },
  header: A,
  hgroup: A,
  hr: A,
  html: {
    attrs: { manifest: null }
  },
  i: A,
  iframe: {
    attrs: {
      src: null,
      srcdoc: null,
      name: null,
      width: null,
      height: null,
      sandbox: ["allow-top-navigation", "allow-same-origin", "allow-forms", "allow-scripts"],
      seamless: ["seamless"]
    }
  },
  img: {
    attrs: {
      alt: null,
      src: null,
      ismap: null,
      usemap: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"]
    }
  },
  input: {
    attrs: {
      alt: null,
      dirname: null,
      form: null,
      formaction: null,
      height: null,
      list: null,
      max: null,
      maxlength: null,
      min: null,
      name: null,
      pattern: null,
      placeholder: null,
      size: null,
      src: null,
      step: null,
      value: null,
      width: null,
      accept: ["audio/*", "video/*", "image/*"],
      autocomplete: ["on", "off"],
      autofocus: ["autofocus"],
      checked: ["checked"],
      disabled: ["disabled"],
      formenctype: qs,
      formmethod: Ds,
      formnovalidate: ["novalidate"],
      formtarget: Vi,
      multiple: ["multiple"],
      readonly: ["readonly"],
      required: ["required"],
      type: [
        "hidden",
        "text",
        "search",
        "tel",
        "url",
        "email",
        "password",
        "datetime",
        "date",
        "month",
        "week",
        "time",
        "datetime-local",
        "number",
        "range",
        "color",
        "checkbox",
        "radio",
        "file",
        "submit",
        "image",
        "reset",
        "button"
      ]
    }
  },
  ins: { attrs: { cite: null, datetime: null } },
  kbd: A,
  keygen: {
    attrs: {
      challenge: null,
      form: null,
      name: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      keytype: ["RSA"]
    }
  },
  label: { attrs: { for: null, form: null } },
  legend: A,
  li: { attrs: { value: null } },
  link: {
    attrs: {
      href: null,
      type: null,
      hreflang: null,
      media: null,
      sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"]
    }
  },
  map: { attrs: { name: null } },
  mark: A,
  menu: { attrs: { label: null, type: ["list", "context", "toolbar"] } },
  meta: {
    attrs: {
      content: null,
      charset: Ys,
      name: ["viewport", "application-name", "author", "description", "generator", "keywords"],
      "http-equiv": ["content-language", "content-type", "default-style", "refresh"]
    }
  },
  meter: { attrs: { value: null, min: null, low: null, high: null, max: null, optimum: null } },
  nav: A,
  noscript: A,
  object: {
    attrs: {
      data: null,
      type: null,
      name: null,
      usemap: null,
      form: null,
      width: null,
      height: null,
      typemustmatch: ["typemustmatch"]
    }
  },
  ol: {
    attrs: { reversed: ["reversed"], start: null, type: ["1", "a", "A", "i", "I"] },
    children: ["li", "script", "template", "ul", "ol"]
  },
  optgroup: { attrs: { disabled: ["disabled"], label: null } },
  option: { attrs: { disabled: ["disabled"], label: null, selected: ["selected"], value: null } },
  output: { attrs: { for: null, form: null, name: null } },
  p: A,
  param: { attrs: { name: null, value: null } },
  pre: A,
  progress: { attrs: { value: null, max: null } },
  q: { attrs: { cite: null } },
  rp: A,
  rt: A,
  ruby: A,
  samp: A,
  script: {
    attrs: {
      type: ["text/javascript"],
      src: null,
      async: ["async"],
      defer: ["defer"],
      charset: Ys
    }
  },
  section: A,
  select: {
    attrs: {
      form: null,
      name: null,
      size: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      multiple: ["multiple"]
    }
  },
  slot: { attrs: { name: null } },
  small: A,
  source: { attrs: { src: null, type: null, media: null } },
  span: A,
  strong: A,
  style: {
    attrs: {
      type: ["text/css"],
      media: null,
      scoped: null
    }
  },
  sub: A,
  summary: A,
  sup: A,
  table: A,
  tbody: A,
  td: { attrs: { colspan: null, rowspan: null, headers: null } },
  template: A,
  textarea: {
    attrs: {
      dirname: null,
      form: null,
      maxlength: null,
      name: null,
      placeholder: null,
      rows: null,
      cols: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      readonly: ["readonly"],
      required: ["required"],
      wrap: ["soft", "hard"]
    }
  },
  tfoot: A,
  th: { attrs: { colspan: null, rowspan: null, headers: null, scope: ["row", "col", "rowgroup", "colgroup"] } },
  thead: A,
  time: { attrs: { datetime: null } },
  title: A,
  tr: A,
  track: {
    attrs: {
      src: null,
      label: null,
      default: null,
      kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
      srclang: null
    }
  },
  ul: { children: ["li", "script", "template", "ul", "ol"] },
  var: A,
  video: {
    attrs: {
      src: null,
      poster: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["auto", "metadata", "none"],
      autoplay: ["autoplay"],
      mediagroup: ["movie"],
      muted: ["muted"],
      controls: ["controls"]
    }
  },
  wbr: A
}, ld = {
  accesskey: null,
  class: null,
  contenteditable: Re,
  contextmenu: null,
  dir: ["ltr", "rtl", "auto"],
  draggable: ["true", "false", "auto"],
  dropzone: ["copy", "move", "link", "string:", "file:"],
  hidden: ["hidden"],
  id: null,
  inert: ["inert"],
  itemid: null,
  itemprop: null,
  itemref: null,
  itemscope: ["itemscope"],
  itemtype: null,
  lang: ["ar", "bn", "de", "en-GB", "en-US", "es", "fr", "hi", "id", "ja", "pa", "pt", "ru", "tr", "zh"],
  spellcheck: Re,
  autocorrect: Re,
  autocapitalize: Re,
  style: null,
  tabindex: null,
  title: null,
  translate: ["yes", "no"],
  rel: ["stylesheet", "alternate", "author", "bookmark", "help", "license", "next", "nofollow", "noreferrer", "prefetch", "prev", "search", "tag"],
  role: /* @__PURE__ */ "alert application article banner button cell checkbox complementary contentinfo dialog document feed figure form grid gridcell heading img list listbox listitem main navigation region row rowgroup search switch tab table tabpanel textbox timer".split(" "),
  "aria-activedescendant": null,
  "aria-atomic": Re,
  "aria-autocomplete": ["inline", "list", "both", "none"],
  "aria-busy": Re,
  "aria-checked": ["true", "false", "mixed", "undefined"],
  "aria-controls": null,
  "aria-describedby": null,
  "aria-disabled": Re,
  "aria-dropeffect": null,
  "aria-expanded": ["true", "false", "undefined"],
  "aria-flowto": null,
  "aria-grabbed": ["true", "false", "undefined"],
  "aria-haspopup": Re,
  "aria-hidden": Re,
  "aria-invalid": ["true", "false", "grammar", "spelling"],
  "aria-label": null,
  "aria-labelledby": null,
  "aria-level": null,
  "aria-live": ["off", "polite", "assertive"],
  "aria-multiline": Re,
  "aria-multiselectable": Re,
  "aria-owns": null,
  "aria-posinset": null,
  "aria-pressed": ["true", "false", "mixed", "undefined"],
  "aria-readonly": Re,
  "aria-relevant": null,
  "aria-required": Re,
  "aria-selected": ["true", "false", "undefined"],
  "aria-setsize": null,
  "aria-sort": ["ascending", "descending", "none", "other"],
  "aria-valuemax": null,
  "aria-valuemin": null,
  "aria-valuenow": null,
  "aria-valuetext": null
}, ad = /* @__PURE__ */ "beforeunload copy cut dragstart dragover dragleave dragenter dragend drag paste focus blur change click load mousedown mouseenter mouseleave mouseup keydown keyup resize scroll unload".split(" ").map((r) => "on" + r);
for (let r of ad)
  ld[r] = null;
class yr {
  constructor(e, t) {
    this.tags = Object.assign(Object.assign({}, RS), e), this.globalAttrs = Object.assign(Object.assign({}, ld), t), this.allTags = Object.keys(this.tags), this.globalAttrNames = Object.keys(this.globalAttrs);
  }
}
yr.default = /* @__PURE__ */ new yr();
function Pi(r, e, t = r.length) {
  if (!e)
    return "";
  let i = e.firstChild, n = i && i.getChild("TagName");
  return n ? r.sliceString(n.from, Math.min(n.to, t)) : "";
}
function $i(r, e = !1) {
  for (; r; r = r.parent)
    if (r.name == "Element")
      if (e)
        e = !1;
      else
        return r;
  return null;
}
function hd(r, e, t) {
  let i = t.tags[Pi(r, $i(e))];
  return (i == null ? void 0 : i.children) || t.allTags;
}
function Rl(r, e) {
  let t = [];
  for (let i = $i(e); i && !i.type.isTop; i = $i(i.parent)) {
    let n = Pi(r, i);
    if (n && i.lastChild.name == "CloseTag")
      break;
    n && t.indexOf(n) < 0 && (e.name == "EndTag" || e.from >= i.firstChild.to) && t.push(n);
  }
  return t;
}
const cd = /^[:\-\.\w\u00b7-\uffff]*$/;
function Ih(r, e, t, i, n) {
  let s = /\s*>/.test(r.sliceDoc(n, n + 5)) ? "" : ">", o = $i(t, !0);
  return {
    from: i,
    to: n,
    options: hd(r.doc, o, e).map((l) => ({ label: l, type: "type" })).concat(Rl(r.doc, t).map((l, a) => ({
      label: "/" + l,
      apply: "/" + l + s,
      type: "type",
      boost: 99 - a
    }))),
    validFor: /^\/?[:\-\.\w\u00b7-\uffff]*$/
  };
}
function jh(r, e, t, i) {
  let n = /\s*>/.test(r.sliceDoc(i, i + 5)) ? "" : ">";
  return {
    from: t,
    to: i,
    options: Rl(r.doc, e).map((s, o) => ({ label: s, apply: s + n, type: "type", boost: 99 - o })),
    validFor: cd
  };
}
function XS(r, e, t, i) {
  let n = [], s = 0;
  for (let o of hd(r.doc, t, e))
    n.push({ label: "<" + o, type: "type" });
  for (let o of Rl(r.doc, t))
    n.push({ label: "</" + o + ">", type: "type", boost: 99 - s++ });
  return { from: i, to: i, options: n, validFor: /^<\/?[:\-\.\w\u00b7-\uffff]*$/ };
}
function MS(r, e, t, i, n) {
  let s = $i(t), o = s ? e.tags[Pi(r.doc, s)] : null, l = o && o.attrs ? Object.keys(o.attrs) : [], a = o && o.globalAttrs === !1 ? l : l.length ? l.concat(e.globalAttrNames) : e.globalAttrNames;
  return {
    from: i,
    to: n,
    options: a.map((h) => ({ label: h, type: "property" })),
    validFor: cd
  };
}
function ES(r, e, t, i, n) {
  var s;
  let o = (s = t.parent) === null || s === void 0 ? void 0 : s.getChild("AttributeName"), l = [], a;
  if (o) {
    let h = r.sliceDoc(o.from, o.to), c = e.globalAttrs[h];
    if (!c) {
      let f = $i(t), d = f ? e.tags[Pi(r.doc, f)] : null;
      c = (d == null ? void 0 : d.attrs) && d.attrs[h];
    }
    if (c) {
      let f = r.sliceDoc(i, n).toLowerCase(), d = '"', O = '"';
      /^['"]/.test(f) ? (a = f[0] == '"' ? /^[^"]*$/ : /^[^']*$/, d = "", O = r.sliceDoc(n, n + 1) == f[0] ? "" : f[0], f = f.slice(1), i++) : a = /^[^\s<>='"]*$/;
      for (let p of c)
        l.push({ label: p, apply: d + p + O, type: "constant" });
    }
  }
  return { from: i, to: n, options: l, validFor: a };
}
function fd(r, e) {
  let { state: t, pos: i } = e, n = H(t).resolveInner(i, -1), s = n.resolve(i);
  for (let o = i, l; s == n && (l = n.childBefore(o)); ) {
    let a = l.lastChild;
    if (!a || !a.type.isError || a.from < a.to)
      break;
    s = n = l, o = a.from;
  }
  return n.name == "TagName" ? n.parent && /CloseTag$/.test(n.parent.name) ? jh(t, n, n.from, i) : Ih(t, r, n, n.from, i) : n.name == "StartTag" ? Ih(t, r, n, i, i) : n.name == "StartCloseTag" || n.name == "IncompleteCloseTag" ? jh(t, n, i, i) : n.name == "OpenTag" || n.name == "SelfClosingTag" || n.name == "AttributeName" ? MS(t, r, n, n.name == "AttributeName" ? n.from : i, i) : n.name == "Is" || n.name == "AttributeValue" || n.name == "UnquotedAttributeValue" ? ES(t, r, n, n.name == "Is" ? i : n.from, i) : e.explicit && (s.name == "Element" || s.name == "Text" || s.name == "Document") ? XS(t, r, n, i) : null;
}
function WS(r) {
  return fd(yr.default, r);
}
function YS(r) {
  let { extraTags: e, extraGlobalAttributes: t } = r, i = t || e ? new yr(e, t) : yr.default;
  return (n) => fd(i, n);
}
const DS = /* @__PURE__ */ ft.parser.configure({ top: "SingleExpression" }), ud = [
  {
    tag: "script",
    attrs: (r) => r.type == "text/typescript" || r.lang == "ts",
    parser: id.parser
  },
  {
    tag: "script",
    attrs: (r) => r.type == "text/babel" || r.type == "text/jsx",
    parser: rd.parser
  },
  {
    tag: "script",
    attrs: (r) => r.type == "text/typescript-jsx",
    parser: nd.parser
  },
  {
    tag: "script",
    attrs(r) {
      return /^(importmap|speculationrules|application\/(.+\+)?json)$/i.test(r.type);
    },
    parser: DS
  },
  {
    tag: "script",
    attrs(r) {
      return !r.type || /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(r.type);
    },
    parser: ft.parser
  },
  {
    tag: "style",
    attrs(r) {
      return (!r.lang || r.lang == "css") && (!r.type || /^(text\/)?(x-)?(stylesheet|css)$/i.test(r.type));
    },
    parser: Ln.parser
  }
], dd = /* @__PURE__ */ [
  {
    name: "style",
    parser: /* @__PURE__ */ Ln.parser.configure({ top: "Styles" })
  }
].concat(/* @__PURE__ */ ad.map((r) => ({ name: r, parser: ft.parser }))), Od = /* @__PURE__ */ ei.define({
  name: "html",
  parser: /* @__PURE__ */ _p.configure({
    props: [
      /* @__PURE__ */ Ti.add({
        Element(r) {
          let e = /^(\s*)(<\/)?/.exec(r.textAfter);
          return r.node.to <= r.pos + e[0].length ? r.continue() : r.lineIndent(r.node.from) + (e[2] ? 0 : r.unit);
        },
        "OpenTag CloseTag SelfClosingTag"(r) {
          return r.column(r.node.from) + r.unit;
        },
        Document(r) {
          if (r.pos + /\s*/.exec(r.textAfter)[0].length < r.node.to)
            return r.continue();
          let e = null, t;
          for (let i = r.node; ; ) {
            let n = i.lastChild;
            if (!n || n.name != "Element" || n.to != i.to)
              break;
            e = i = n;
          }
          return e && !((t = e.lastChild) && (t.name == "CloseTag" || t.name == "SelfClosingTag")) ? r.lineIndent(e.from) + r.unit : null;
        }
      }),
      /* @__PURE__ */ ri.add({
        Element(r) {
          let e = r.firstChild, t = r.lastChild;
          return !e || e.name != "OpenTag" ? null : { from: e.to, to: t.name == "CloseTag" ? t.from : r.to };
        }
      }),
      /* @__PURE__ */ Wu.add({
        "OpenTag CloseTag": (r) => r.getChild("TagName")
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "<!--", close: "-->" } },
    indentOnInput: /^\s*<\/\w+\W$/,
    wordChars: "-._"
  }
}), kn = /* @__PURE__ */ Od.configure({
  wrap: /* @__PURE__ */ Nc(ud, dd)
});
function pd(r = {}) {
  let e = "", t;
  r.matchClosingTags === !1 && (e = "noMatch"), r.selfClosingTags === !0 && (e = (e ? e + " " : "") + "selfClosing"), (r.nestedLanguages && r.nestedLanguages.length || r.nestedAttributes && r.nestedAttributes.length) && (t = Nc((r.nestedLanguages || []).concat(ud), (r.nestedAttributes || []).concat(dd)));
  let i = t ? Od.configure({ wrap: t, dialect: e }) : e ? kn.configure({ dialect: e }) : kn;
  return new wi(i, [
    kn.data.of({ autocomplete: YS(r) }),
    r.autoCloseTags !== !1 ? qS : [],
    Al().support,
    Kb().support
  ]);
}
const Gh = /* @__PURE__ */ new Set(/* @__PURE__ */ "area base br col command embed frame hr img input keygen link meta param source track wbr menuitem".split(" ")), qS = /* @__PURE__ */ C.inputHandler.of((r, e, t, i, n) => {
  if (r.composing || r.state.readOnly || e != t || i != ">" && i != "/" || !kn.isActiveAt(r.state, e, -1))
    return !1;
  let s = n(), { state: o } = s, l = o.changeByRange((a) => {
    var h, c, f;
    let d = o.doc.sliceString(a.from - 1, a.to) == i, { head: O } = a, p = H(o).resolveInner(O, -1), m;
    if (d && i == ">" && p.name == "EndTag") {
      let g = p.parent;
      if (((c = (h = g.parent) === null || h === void 0 ? void 0 : h.lastChild) === null || c === void 0 ? void 0 : c.name) != "CloseTag" && (m = Pi(o.doc, g.parent, O)) && !Gh.has(m)) {
        let b = O + (o.doc.sliceString(O, O + 1) === ">" ? 1 : 0), S = `</${m}>`;
        return { range: a, changes: { from: O, to: b, insert: S } };
      }
    } else if (d && i == "/" && p.name == "IncompleteCloseTag") {
      let g = p.parent;
      if (p.from == O - 2 && ((f = g.lastChild) === null || f === void 0 ? void 0 : f.name) != "CloseTag" && (m = Pi(o.doc, g, O)) && !Gh.has(m)) {
        let b = O + (o.doc.sliceString(O, O + 1) === ">" ? 1 : 0), S = `${m}>`;
        return {
          range: y.cursor(O + S.length, -1),
          changes: { from: O, to: b, insert: S }
        };
      }
    }
    return { range: a };
  });
  return l.changes.empty ? !1 : (r.dispatch([
    s,
    o.update(l, {
      userEvent: "input.complete",
      scrollIntoView: !0
    })
  ]), !0);
}), VS = ii({
  String: u.string,
  Number: u.number,
  "True False": u.bool,
  PropertyName: u.propertyName,
  Null: u.null,
  ",": u.separator,
  "[ ]": u.squareBracket,
  "{ }": u.brace
}), BS = Gt.deserialize({
  version: 14,
  states: "$bOVQPOOOOQO'#Cb'#CbOnQPO'#CeOvQPO'#CjOOQO'#Cp'#CpQOQPOOOOQO'#Cg'#CgO}QPO'#CfO!SQPO'#CrOOQO,59P,59PO![QPO,59PO!aQPO'#CuOOQO,59U,59UO!iQPO,59UOVQPO,59QOqQPO'#CkO!nQPO,59^OOQO1G.k1G.kOVQPO'#ClO!vQPO,59aOOQO1G.p1G.pOOQO1G.l1G.lOOQO,59V,59VOOQO-E6i-E6iOOQO,59W,59WOOQO-E6j-E6j",
  stateData: "#O~OcOS~OQSORSOSSOTSOWQO]ROePO~OVXOeUO~O[[O~PVOg^O~Oh_OVfX~OVaO~OhbO[iX~O[dO~Oh_OVfa~OhbO[ia~O",
  goto: "!kjPPPPPPkPPkqwPPk{!RPPP!XP!ePP!hXSOR^bQWQRf_TVQ_Q`WRg`QcZRicQTOQZRQe^RhbRYQR]R",
  nodeNames: "⚠ JsonText True False Null Number String } { Object Property PropertyName ] [ Array",
  maxTerm: 25,
  nodeProps: [
    ["isolate", -2, 6, 11, ""],
    ["openedBy", 7, "{", 12, "["],
    ["closedBy", 8, "}", 13, "]"]
  ],
  propSources: [VS],
  skippedNodes: [0],
  repeatNodeCount: 2,
  tokenData: "(|~RaXY!WYZ!W]^!Wpq!Wrs!]|}$u}!O$z!Q!R%T!R![&c![!]&t!}#O&y#P#Q'O#Y#Z'T#b#c'r#h#i(Z#o#p(r#q#r(w~!]Oc~~!`Wpq!]qr!]rs!xs#O!]#O#P!}#P;'S!];'S;=`$o<%lO!]~!}Oe~~#QXrs!]!P!Q!]#O#P!]#U#V!]#Y#Z!]#b#c!]#f#g!]#h#i!]#i#j#m~#pR!Q![#y!c!i#y#T#Z#y~#|R!Q![$V!c!i$V#T#Z$V~$YR!Q![$c!c!i$c#T#Z$c~$fR!Q![!]!c!i!]#T#Z!]~$rP;=`<%l!]~$zOh~~$}Q!Q!R%T!R![&c~%YRT~!O!P%c!g!h%w#X#Y%w~%fP!Q![%i~%nRT~!Q![%i!g!h%w#X#Y%w~%zR{|&T}!O&T!Q![&Z~&WP!Q![&Z~&`PT~!Q![&Z~&hST~!O!P%c!Q![&c!g!h%w#X#Y%w~&yOg~~'OO]~~'TO[~~'WP#T#U'Z~'^P#`#a'a~'dP#g#h'g~'jP#X#Y'm~'rOR~~'uP#i#j'x~'{P#`#a(O~(RP#`#a(U~(ZOS~~(^P#f#g(a~(dP#i#j(g~(jP#X#Y(m~(rOQ~~(wOW~~(|OV~",
  tokenizers: [0],
  topRules: { JsonText: [0, 1] },
  tokenPrec: 0
}), zS = /* @__PURE__ */ ei.define({
  name: "json",
  parser: /* @__PURE__ */ BS.configure({
    props: [
      /* @__PURE__ */ Ti.add({
        Object: /* @__PURE__ */ mi({ except: /^\s*\}/ }),
        Array: /* @__PURE__ */ mi({ except: /^\s*\]/ })
      }),
      /* @__PURE__ */ ri.add({
        "Object Array": Ql
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["[", "{", '"'] },
    indentOnInput: /^\s*[\}\]]$/
  }
});
function Fh() {
  return new wi(zS);
}
class Un {
  static create(e, t, i, n, s) {
    let o = n + (n << 8) + e + (t << 4) | 0;
    return new Un(e, t, i, o, s, [], []);
  }
  constructor(e, t, i, n, s, o, l) {
    this.type = e, this.value = t, this.from = i, this.hash = n, this.end = s, this.children = o, this.positions = l, this.hashProp = [[X.contextHash, n]];
  }
  addChild(e, t) {
    e.prop(X.contextHash) != this.hash && (e = new _(e.type, e.children, e.positions, e.length, this.hashProp)), this.children.push(e), this.positions.push(t);
  }
  toTree(e, t = this.end) {
    let i = this.children.length - 1;
    return i >= 0 && (t = Math.max(t, this.positions[i] + this.children[i].length + this.from)), new _(e.types[this.type], this.children, this.positions, t - this.from).balance({
      makeTree: (n, s, o) => new _(ae.none, n, s, o, this.hashProp)
    });
  }
}
var w;
(function(r) {
  r[r.Document = 1] = "Document", r[r.CodeBlock = 2] = "CodeBlock", r[r.FencedCode = 3] = "FencedCode", r[r.Blockquote = 4] = "Blockquote", r[r.HorizontalRule = 5] = "HorizontalRule", r[r.BulletList = 6] = "BulletList", r[r.OrderedList = 7] = "OrderedList", r[r.ListItem = 8] = "ListItem", r[r.ATXHeading1 = 9] = "ATXHeading1", r[r.ATXHeading2 = 10] = "ATXHeading2", r[r.ATXHeading3 = 11] = "ATXHeading3", r[r.ATXHeading4 = 12] = "ATXHeading4", r[r.ATXHeading5 = 13] = "ATXHeading5", r[r.ATXHeading6 = 14] = "ATXHeading6", r[r.SetextHeading1 = 15] = "SetextHeading1", r[r.SetextHeading2 = 16] = "SetextHeading2", r[r.HTMLBlock = 17] = "HTMLBlock", r[r.LinkReference = 18] = "LinkReference", r[r.Paragraph = 19] = "Paragraph", r[r.CommentBlock = 20] = "CommentBlock", r[r.ProcessingInstructionBlock = 21] = "ProcessingInstructionBlock", r[r.Escape = 22] = "Escape", r[r.Entity = 23] = "Entity", r[r.HardBreak = 24] = "HardBreak", r[r.Emphasis = 25] = "Emphasis", r[r.StrongEmphasis = 26] = "StrongEmphasis", r[r.Link = 27] = "Link", r[r.Image = 28] = "Image", r[r.InlineCode = 29] = "InlineCode", r[r.HTMLTag = 30] = "HTMLTag", r[r.Comment = 31] = "Comment", r[r.ProcessingInstruction = 32] = "ProcessingInstruction", r[r.Autolink = 33] = "Autolink", r[r.HeaderMark = 34] = "HeaderMark", r[r.QuoteMark = 35] = "QuoteMark", r[r.ListMark = 36] = "ListMark", r[r.LinkMark = 37] = "LinkMark", r[r.EmphasisMark = 38] = "EmphasisMark", r[r.CodeMark = 39] = "CodeMark", r[r.CodeText = 40] = "CodeText", r[r.CodeInfo = 41] = "CodeInfo", r[r.LinkTitle = 42] = "LinkTitle", r[r.LinkLabel = 43] = "LinkLabel", r[r.URL = 44] = "URL";
})(w || (w = {}));
class LS {
  /// @internal
  constructor(e, t) {
    this.start = e, this.content = t, this.marks = [], this.parsers = [];
  }
}
class NS {
  constructor() {
    this.text = "", this.baseIndent = 0, this.basePos = 0, this.depth = 0, this.markers = [], this.pos = 0, this.indent = 0, this.next = -1;
  }
  /// @internal
  forward() {
    this.basePos > this.pos && this.forwardInner();
  }
  /// @internal
  forwardInner() {
    let e = this.skipSpace(this.basePos);
    this.indent = this.countIndent(e, this.pos, this.indent), this.pos = e, this.next = e == this.text.length ? -1 : this.text.charCodeAt(e);
  }
  /// Skip whitespace after the given position, return the position of
  /// the next non-space character or the end of the line if there's
  /// only space after `from`.
  skipSpace(e) {
    return er(this.text, e);
  }
  /// @internal
  reset(e) {
    for (this.text = e, this.baseIndent = this.basePos = this.pos = this.indent = 0, this.forwardInner(), this.depth = 1; this.markers.length; )
      this.markers.pop();
  }
  /// Move the line's base position forward to the given position.
  /// This should only be called by composite [block
  /// parsers](#BlockParser.parse) or [markup skipping
  /// functions](#NodeSpec.composite).
  moveBase(e) {
    this.basePos = e, this.baseIndent = this.countIndent(e, this.pos, this.indent);
  }
  /// Move the line's base position forward to the given _column_.
  moveBaseColumn(e) {
    this.baseIndent = e, this.basePos = this.findColumn(e);
  }
  /// Store a composite-block-level marker. Should be called from
  /// [markup skipping functions](#NodeSpec.composite) when they
  /// consume any non-whitespace characters.
  addMarker(e) {
    this.markers.push(e);
  }
  /// Find the column position at `to`, optionally starting at a given
  /// position and column.
  countIndent(e, t = 0, i = 0) {
    for (let n = t; n < e; n++)
      i += this.text.charCodeAt(n) == 9 ? 4 - i % 4 : 1;
    return i;
  }
  /// Find the position corresponding to the given column.
  findColumn(e) {
    let t = 0;
    for (let i = 0; t < this.text.length && i < e; t++)
      i += this.text.charCodeAt(t) == 9 ? 4 - i % 4 : 1;
    return t;
  }
  /// @internal
  scrub() {
    if (!this.baseIndent)
      return this.text;
    let e = "";
    for (let t = 0; t < this.basePos; t++)
      e += " ";
    return e + this.text.slice(this.basePos);
  }
}
function Hh(r, e, t) {
  if (t.pos == t.text.length || r != e.block && t.indent >= e.stack[t.depth + 1].value + t.baseIndent)
    return !0;
  if (t.indent >= t.baseIndent + 4)
    return !1;
  let i = (r.type == w.OrderedList ? El : Ml)(t, e, !1);
  return i > 0 && (r.type != w.BulletList || Xl(t, e, !1) < 0) && t.text.charCodeAt(t.pos + i - 1) == r.value;
}
const md = {
  [w.Blockquote](r, e, t) {
    return t.next != 62 ? !1 : (t.markers.push(V(w.QuoteMark, e.lineStart + t.pos, e.lineStart + t.pos + 1)), t.moveBase(t.pos + (Ue(t.text.charCodeAt(t.pos + 1)) ? 2 : 1)), r.end = e.lineStart + t.text.length, !0);
  },
  [w.ListItem](r, e, t) {
    return t.indent < t.baseIndent + r.value && t.next > -1 ? !1 : (t.moveBaseColumn(t.baseIndent + r.value), !0);
  },
  [w.OrderedList]: Hh,
  [w.BulletList]: Hh,
  [w.Document]() {
    return !0;
  }
};
function Ue(r) {
  return r == 32 || r == 9 || r == 10 || r == 13;
}
function er(r, e = 0) {
  for (; e < r.length && Ue(r.charCodeAt(e)); )
    e++;
  return e;
}
function Kh(r, e, t) {
  for (; e > t && Ue(r.charCodeAt(e - 1)); )
    e--;
  return e;
}
function gd(r) {
  if (r.next != 96 && r.next != 126)
    return -1;
  let e = r.pos + 1;
  for (; e < r.text.length && r.text.charCodeAt(e) == r.next; )
    e++;
  if (e < r.pos + 3)
    return -1;
  if (r.next == 96) {
    for (let t = e; t < r.text.length; t++)
      if (r.text.charCodeAt(t) == 96)
        return -1;
  }
  return e;
}
function bd(r) {
  return r.next != 62 ? -1 : r.text.charCodeAt(r.pos + 1) == 32 ? 2 : 1;
}
function Xl(r, e, t) {
  if (r.next != 42 && r.next != 45 && r.next != 95)
    return -1;
  let i = 1;
  for (let n = r.pos + 1; n < r.text.length; n++) {
    let s = r.text.charCodeAt(n);
    if (s == r.next)
      i++;
    else if (!Ue(s))
      return -1;
  }
  return t && r.next == 45 && xd(r) > -1 && r.depth == e.stack.length || i < 3 ? -1 : 1;
}
function Sd(r, e) {
  for (let t = r.stack.length - 1; t >= 0; t--)
    if (r.stack[t].type == e)
      return !0;
  return !1;
}
function Ml(r, e, t) {
  return (r.next == 45 || r.next == 43 || r.next == 42) && (r.pos == r.text.length - 1 || Ue(r.text.charCodeAt(r.pos + 1))) && (!t || Sd(e, w.BulletList) || r.skipSpace(r.pos + 2) < r.text.length) ? 1 : -1;
}
function El(r, e, t) {
  let i = r.pos, n = r.next;
  for (; n >= 48 && n <= 57; ) {
    i++;
    if (i == r.text.length)
      return -1;
    n = r.text.charCodeAt(i);
  }
  return i == r.pos || i > r.pos + 9 || n != 46 && n != 41 || i < r.text.length - 1 && !Ue(r.text.charCodeAt(i + 1)) || t && !Sd(e, w.OrderedList) && (r.skipSpace(i + 1) == r.text.length || i > r.pos + 1 || r.next != 49) ? -1 : i + 1 - r.pos;
}
function yd(r) {
  if (r.next != 35)
    return -1;
  let e = r.pos + 1;
  for (; e < r.text.length && r.text.charCodeAt(e) == 35; )
    e++;
  if (e < r.text.length && r.text.charCodeAt(e) != 32)
    return -1;
  let t = e - r.pos;
  return t > 6 ? -1 : t;
}
function xd(r) {
  if (r.next != 45 && r.next != 61 || r.indent >= r.baseIndent + 4)
    return -1;
  let e = r.pos + 1;
  for (; e < r.text.length && r.text.charCodeAt(e) == r.next; )
    e++;
  let t = e;
  for (; e < r.text.length && Ue(r.text.charCodeAt(e)); )
    e++;
  return e == r.text.length ? t : -1;
}
const qo = /^[ \t]*$/, kd = /-->/, Qd = /\?>/, Vo = [
  [/^<(?:script|pre|style)(?:\s|>|$)/i, /<\/(?:script|pre|style)>/i],
  [/^\s*<!--/, kd],
  [/^\s*<\?/, Qd],
  [/^\s*<![A-Z]/, />/],
  [/^\s*<!\[CDATA\[/, /\]\]>/],
  [/^\s*<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)/i, qo],
  [/^\s*(?:<\/[a-z][\w-]*\s*>|<[a-z][\w-]*(\s+[a-z:_][\w-.]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*>)\s*$/i, qo]
];
function wd(r, e, t) {
  if (r.next != 60)
    return -1;
  let i = r.text.slice(r.pos);
  for (let n = 0, s = Vo.length - (t ? 1 : 0); n < s; n++)
    if (Vo[n][0].test(i))
      return n;
  return -1;
}
function Jh(r, e) {
  let t = r.countIndent(e, r.pos, r.indent), i = r.countIndent(r.skipSpace(e), e, t);
  return i >= t + 5 ? t + 1 : i;
}
function zt(r, e, t) {
  let i = r.length - 1;
  i >= 0 && r[i].to == e && r[i].type == w.CodeText ? r[i].to = t : r.push(V(w.CodeText, e, t));
}
const nn = {
  LinkReference: void 0,
  IndentedCode(r, e) {
    let t = e.baseIndent + 4;
    if (e.indent < t)
      return !1;
    let i = e.findColumn(t), n = r.lineStart + i, s = r.lineStart + e.text.length, o = [], l = [];
    for (zt(o, n, s); r.nextLine() && e.depth >= r.stack.length; )
      if (e.pos == e.text.length) {
        zt(l, r.lineStart - 1, r.lineStart);
        for (let a of e.markers)
          l.push(a);
      } else {
        if (e.indent < t)
          break;
        {
          if (l.length) {
            for (let h of l)
              h.type == w.CodeText ? zt(o, h.from, h.to) : o.push(h);
            l = [];
          }
          zt(o, r.lineStart - 1, r.lineStart);
          for (let h of e.markers)
            o.push(h);
          s = r.lineStart + e.text.length;
          let a = r.lineStart + e.findColumn(e.baseIndent + 4);
          a < s && zt(o, a, s);
        }
      }
    return l.length && (l = l.filter((a) => a.type != w.CodeText), l.length && (e.markers = l.concat(e.markers))), r.addNode(r.buffer.writeElements(o, -n).finish(w.CodeBlock, s - n), n), !0;
  },
  FencedCode(r, e) {
    let t = gd(e);
    if (t < 0)
      return !1;
    let i = r.lineStart + e.pos, n = e.next, s = t - e.pos, o = e.skipSpace(t), l = Kh(e.text, e.text.length, o), a = [V(w.CodeMark, i, i + s)];
    o < l && a.push(V(w.CodeInfo, r.lineStart + o, r.lineStart + l));
    for (let h = !0; r.nextLine() && e.depth >= r.stack.length; h = !1) {
      let c = e.pos;
      if (e.indent - e.baseIndent < 4)
        for (; c < e.text.length && e.text.charCodeAt(c) == n; )
          c++;
      if (c - e.pos >= s && e.skipSpace(c) == e.text.length) {
        for (let f of e.markers)
          a.push(f);
        a.push(V(w.CodeMark, r.lineStart + e.pos, r.lineStart + c)), r.nextLine();
        break;
      } else {
        h || zt(a, r.lineStart - 1, r.lineStart);
        for (let O of e.markers)
          a.push(O);
        let f = r.lineStart + e.basePos, d = r.lineStart + e.text.length;
        f < d && zt(a, f, d);
      }
    }
    return r.addNode(r.buffer.writeElements(a, -i).finish(w.FencedCode, r.prevLineEnd() - i), i), !0;
  },
  Blockquote(r, e) {
    let t = bd(e);
    return t < 0 ? !1 : (r.startContext(w.Blockquote, e.pos), r.addNode(w.QuoteMark, r.lineStart + e.pos, r.lineStart + e.pos + 1), e.moveBase(e.pos + t), null);
  },
  HorizontalRule(r, e) {
    if (Xl(e, r, !1) < 0)
      return !1;
    let t = r.lineStart + e.pos;
    return r.nextLine(), r.addNode(w.HorizontalRule, t), !0;
  },
  BulletList(r, e) {
    let t = Ml(e, r, !1);
    if (t < 0)
      return !1;
    r.block.type != w.BulletList && r.startContext(w.BulletList, e.basePos, e.next);
    let i = Jh(e, e.pos + 1);
    return r.startContext(w.ListItem, e.basePos, i - e.baseIndent), r.addNode(w.ListMark, r.lineStart + e.pos, r.lineStart + e.pos + t), e.moveBaseColumn(i), null;
  },
  OrderedList(r, e) {
    let t = El(e, r, !1);
    if (t < 0)
      return !1;
    r.block.type != w.OrderedList && r.startContext(w.OrderedList, e.basePos, e.text.charCodeAt(e.pos + t - 1));
    let i = Jh(e, e.pos + t);
    return r.startContext(w.ListItem, e.basePos, i - e.baseIndent), r.addNode(w.ListMark, r.lineStart + e.pos, r.lineStart + e.pos + t), e.moveBaseColumn(i), null;
  },
  ATXHeading(r, e) {
    let t = yd(e);
    if (t < 0)
      return !1;
    let i = e.pos, n = r.lineStart + i, s = Kh(e.text, e.text.length, i), o = s;
    for (; o > i && e.text.charCodeAt(o - 1) == e.next; )
      o--;
    (o == s || o == i || !Ue(e.text.charCodeAt(o - 1))) && (o = e.text.length);
    let l = r.buffer.write(w.HeaderMark, 0, t).writeElements(r.parser.parseInline(e.text.slice(i + t + 1, o), n + t + 1), -n);
    o < e.text.length && l.write(w.HeaderMark, o - i, s - i);
    let a = l.finish(w.ATXHeading1 - 1 + t, e.text.length - i);
    return r.nextLine(), r.addNode(a, n), !0;
  },
  HTMLBlock(r, e) {
    let t = wd(e, r, !1);
    if (t < 0)
      return !1;
    let i = r.lineStart + e.pos, n = Vo[t][1], s = [], o = n != qo;
    for (; !n.test(e.text) && r.nextLine(); ) {
      if (e.depth < r.stack.length) {
        o = !1;
        break;
      }
      for (let h of e.markers)
        s.push(h);
    }
    o && r.nextLine();
    let l = n == kd ? w.CommentBlock : n == Qd ? w.ProcessingInstructionBlock : w.HTMLBlock, a = r.prevLineEnd();
    return r.addNode(r.buffer.writeElements(s, -i).finish(l, a - i), i), !0;
  },
  SetextHeading: void 0
  // Specifies relative precedence for block-continue function
};
class _S {
  constructor(e) {
    this.stage = 0, this.elts = [], this.pos = 0, this.start = e.start, this.advance(e.content);
  }
  nextLine(e, t, i) {
    if (this.stage == -1)
      return !1;
    let n = i.content + `
` + t.scrub(), s = this.advance(n);
    return s > -1 && s < n.length ? this.complete(e, i, s) : !1;
  }
  finish(e, t) {
    return (this.stage == 2 || this.stage == 3) && er(t.content, this.pos) == t.content.length ? this.complete(e, t, t.content.length) : !1;
  }
  complete(e, t, i) {
    return e.addLeafElement(t, V(w.LinkReference, this.start, this.start + i, this.elts)), !0;
  }
  nextStage(e) {
    return e ? (this.pos = e.to - this.start, this.elts.push(e), this.stage++, !0) : (e === !1 && (this.stage = -1), !1);
  }
  advance(e) {
    for (; ; ) {
      if (this.stage == -1)
        return -1;
      if (this.stage == 0) {
        if (!this.nextStage(Xd(e, this.pos, this.start, !0)))
          return -1;
        if (e.charCodeAt(this.pos) != 58)
          return this.stage = -1;
        this.elts.push(V(w.LinkMark, this.pos + this.start, this.pos + this.start + 1)), this.pos++;
      } else if (this.stage == 1) {
        if (!this.nextStage(Ad(e, er(e, this.pos), this.start)))
          return -1;
      } else if (this.stage == 2) {
        let t = er(e, this.pos), i = 0;
        if (t > this.pos) {
          let n = Rd(e, t, this.start);
          if (n) {
            let s = Vs(e, n.to - this.start);
            s > 0 && (this.nextStage(n), i = s);
          }
        }
        return i || (i = Vs(e, this.pos)), i > 0 && i < e.length ? i : -1;
      } else
        return Vs(e, this.pos);
    }
  }
}
function Vs(r, e) {
  for (; e < r.length; e++) {
    let t = r.charCodeAt(e);
    if (t == 10)
      break;
    if (!Ue(t))
      return -1;
  }
  return e;
}
class US {
  nextLine(e, t, i) {
    let n = t.depth < e.stack.length ? -1 : xd(t), s = t.next;
    if (n < 0)
      return !1;
    let o = V(w.HeaderMark, e.lineStart + t.pos, e.lineStart + n);
    return e.nextLine(), e.addLeafElement(i, V(s == 61 ? w.SetextHeading1 : w.SetextHeading2, i.start, e.prevLineEnd(), [
      ...e.parser.parseInline(i.content, i.start),
      o
    ])), !0;
  }
  finish() {
    return !1;
  }
}
const IS = {
  LinkReference(r, e) {
    return e.content.charCodeAt(0) == 91 ? new _S(e) : null;
  },
  SetextHeading() {
    return new US();
  }
}, jS = [
  (r, e) => yd(e) >= 0,
  (r, e) => gd(e) >= 0,
  (r, e) => bd(e) >= 0,
  (r, e) => Ml(e, r, !0) >= 0,
  (r, e) => El(e, r, !0) >= 0,
  (r, e) => Xl(e, r, !0) >= 0,
  (r, e) => wd(e, r, !0) >= 0
], GS = { text: "", end: 0 };
class FS {
  /// @internal
  constructor(e, t, i, n) {
    this.parser = e, this.input = t, this.ranges = n, this.line = new NS(), this.atEnd = !1, this.reusePlaceholders = /* @__PURE__ */ new Map(), this.stoppedAt = null, this.rangeI = 0, this.to = n[n.length - 1].to, this.lineStart = this.absoluteLineStart = this.absoluteLineEnd = n[0].from, this.block = Un.create(w.Document, 0, this.lineStart, 0, 0), this.stack = [this.block], this.fragments = i.length ? new ey(i, t) : null, this.readLine();
  }
  get parsedPos() {
    return this.absoluteLineStart;
  }
  advance() {
    if (this.stoppedAt != null && this.absoluteLineStart > this.stoppedAt)
      return this.finish();
    let { line: e } = this;
    for (; ; ) {
      for (let i = 0; ; ) {
        let n = e.depth < this.stack.length ? this.stack[this.stack.length - 1] : null;
        for (; i < e.markers.length && (!n || e.markers[i].from < n.end); ) {
          let s = e.markers[i++];
          this.addNode(s.type, s.from, s.to);
        }
        if (!n)
          break;
        this.finishContext();
      }
      if (e.pos < e.text.length)
        break;
      if (!this.nextLine())
        return this.finish();
    }
    if (this.fragments && this.reuseFragment(e.basePos))
      return null;
    e: for (; ; ) {
      for (let i of this.parser.blockParsers)
        if (i) {
          let n = i(this, e);
          if (n != !1) {
            if (n == !0)
              return null;
            e.forward();
            continue e;
          }
        }
      break;
    }
    let t = new LS(this.lineStart + e.pos, e.text.slice(e.pos));
    for (let i of this.parser.leafBlockParsers)
      if (i) {
        let n = i(this, t);
        n && t.parsers.push(n);
      }
    e: for (; this.nextLine() && e.pos != e.text.length; ) {
      if (e.indent < e.baseIndent + 4) {
        for (let i of this.parser.endLeafBlock)
          if (i(this, e, t))
            break e;
      }
      for (let i of t.parsers)
        if (i.nextLine(this, e, t))
          return null;
      t.content += `
` + e.scrub();
      for (let i of e.markers)
        t.marks.push(i);
    }
    return this.finishLeaf(t), null;
  }
  stopAt(e) {
    if (this.stoppedAt != null && this.stoppedAt < e)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = e;
  }
  reuseFragment(e) {
    if (!this.fragments.moveTo(this.absoluteLineStart + e, this.absoluteLineStart) || !this.fragments.matches(this.block.hash))
      return !1;
    let t = this.fragments.takeNodes(this);
    return t ? (this.absoluteLineStart += t, this.lineStart = Md(this.absoluteLineStart, this.ranges), this.moveRangeI(), this.absoluteLineStart < this.to ? (this.lineStart++, this.absoluteLineStart++, this.readLine()) : (this.atEnd = !0, this.readLine()), !0) : !1;
  }
  /// The number of parent blocks surrounding the current block.
  get depth() {
    return this.stack.length;
  }
  /// Get the type of the parent block at the given depth. When no
  /// depth is passed, return the type of the innermost parent.
  parentType(e = this.depth - 1) {
    return this.parser.nodeSet.types[this.stack[e].type];
  }
  /// Move to the next input line. This should only be called by
  /// (non-composite) [block parsers](#BlockParser.parse) that consume
  /// the line directly, or leaf block parser
  /// [`nextLine`](#LeafBlockParser.nextLine) methods when they
  /// consume the current line (and return true).
  nextLine() {
    return this.lineStart += this.line.text.length, this.absoluteLineEnd >= this.to ? (this.absoluteLineStart = this.absoluteLineEnd, this.atEnd = !0, this.readLine(), !1) : (this.lineStart++, this.absoluteLineStart = this.absoluteLineEnd + 1, this.moveRangeI(), this.readLine(), !0);
  }
  moveRangeI() {
    for (; this.rangeI < this.ranges.length - 1 && this.absoluteLineStart >= this.ranges[this.rangeI].to; )
      this.rangeI++, this.absoluteLineStart = Math.max(this.absoluteLineStart, this.ranges[this.rangeI].from);
  }
  /// @internal
  scanLine(e) {
    let t = GS;
    if (t.end = e, e >= this.to)
      t.text = "";
    else if (t.text = this.lineChunkAt(e), t.end += t.text.length, this.ranges.length > 1) {
      let i = this.absoluteLineStart, n = this.rangeI;
      for (; this.ranges[n].to < t.end; ) {
        n++;
        let s = this.ranges[n].from, o = this.lineChunkAt(s);
        t.end = s + o.length, t.text = t.text.slice(0, this.ranges[n - 1].to - i) + o, i = t.end - t.text.length;
      }
    }
    return t;
  }
  /// @internal
  readLine() {
    let { line: e } = this, { text: t, end: i } = this.scanLine(this.absoluteLineStart);
    for (this.absoluteLineEnd = i, e.reset(t); e.depth < this.stack.length; e.depth++) {
      let n = this.stack[e.depth], s = this.parser.skipContextMarkup[n.type];
      if (!s)
        throw new Error("Unhandled block context " + w[n.type]);
      if (!s(n, this, e))
        break;
      e.forward();
    }
  }
  lineChunkAt(e) {
    let t = this.input.chunk(e), i;
    if (this.input.lineChunks)
      i = t == `
` ? "" : t;
    else {
      let n = t.indexOf(`
`);
      i = n < 0 ? t : t.slice(0, n);
    }
    return e + i.length > this.to ? i.slice(0, this.to - e) : i;
  }
  /// The end position of the previous line.
  prevLineEnd() {
    return this.atEnd ? this.lineStart : this.lineStart - 1;
  }
  /// @internal
  startContext(e, t, i = 0) {
    this.block = Un.create(e, i, this.lineStart + t, this.block.hash, this.lineStart + this.line.text.length), this.stack.push(this.block);
  }
  /// Start a composite block. Should only be called from [block
  /// parser functions](#BlockParser.parse) that return null.
  startComposite(e, t, i = 0) {
    this.startContext(this.parser.getNodeType(e), t, i);
  }
  /// @internal
  addNode(e, t, i) {
    typeof e == "number" && (e = new _(this.parser.nodeSet.types[e], vi, vi, (i ?? this.prevLineEnd()) - t)), this.block.addChild(e, t - this.block.from);
  }
  /// Add a block element. Can be called by [block
  /// parsers](#BlockParser.parse).
  addElement(e) {
    this.block.addChild(e.toTree(this.parser.nodeSet), e.from - this.block.from);
  }
  /// Add a block element from a [leaf parser](#LeafBlockParser). This
  /// makes sure any extra composite block markup (such as blockquote
  /// markers) inside the block are also added to the syntax tree.
  addLeafElement(e, t) {
    this.addNode(this.buffer.writeElements(Lo(t.children, e.marks), -t.from).finish(t.type, t.to - t.from), t.from);
  }
  /// @internal
  finishContext() {
    let e = this.stack.pop(), t = this.stack[this.stack.length - 1];
    t.addChild(e.toTree(this.parser.nodeSet), e.from - t.from), this.block = t;
  }
  finish() {
    for (; this.stack.length > 1; )
      this.finishContext();
    return this.addGaps(this.block.toTree(this.parser.nodeSet, this.lineStart));
  }
  addGaps(e) {
    return this.ranges.length > 1 ? Pd(this.ranges, 0, e.topNode, this.ranges[0].from, this.reusePlaceholders) : e;
  }
  /// @internal
  finishLeaf(e) {
    for (let i of e.parsers)
      if (i.finish(this, e))
        return;
    let t = Lo(this.parser.parseInline(e.content, e.start), e.marks);
    this.addNode(this.buffer.writeElements(t, -e.start).finish(w.Paragraph, e.content.length), e.start);
  }
  elt(e, t, i, n) {
    return typeof e == "string" ? V(this.parser.getNodeType(e), t, i, n) : new Cd(e, t);
  }
  /// @internal
  get buffer() {
    return new vd(this.parser.nodeSet);
  }
}
function Pd(r, e, t, i, n) {
  let s = r[e].to, o = [], l = [], a = t.from + i;
  function h(c, f) {
    for (; f ? c >= s : c > s; ) {
      let d = r[e + 1].from - s;
      i += d, c += d, e++, s = r[e].to;
    }
  }
  for (let c = t.firstChild; c; c = c.nextSibling) {
    h(c.from + i, !0);
    let f = c.from + i, d, O = n.get(c.tree);
    O ? d = O : c.to + i > s ? (d = Pd(r, e, c, i, n), h(c.to + i, !1)) : d = c.toTree(), o.push(d), l.push(f - a);
  }
  return h(t.to + i, !1), new _(t.type, o, l, t.to + i - a, t.tree ? t.tree.propValues : void 0);
}
class ss extends il {
  /// @internal
  constructor(e, t, i, n, s, o, l, a, h) {
    super(), this.nodeSet = e, this.blockParsers = t, this.leafBlockParsers = i, this.blockNames = n, this.endLeafBlock = s, this.skipContextMarkup = o, this.inlineParsers = l, this.inlineNames = a, this.wrappers = h, this.nodeTypes = /* @__PURE__ */ Object.create(null);
    for (let c of e.types)
      this.nodeTypes[c.name] = c.id;
  }
  createParse(e, t, i) {
    let n = new FS(this, e, t, i);
    for (let s of this.wrappers)
      n = s(n, e, t, i);
    return n;
  }
  /// Reconfigure the parser.
  configure(e) {
    let t = Bo(e);
    if (!t)
      return this;
    let { nodeSet: i, skipContextMarkup: n } = this, s = this.blockParsers.slice(), o = this.leafBlockParsers.slice(), l = this.blockNames.slice(), a = this.inlineParsers.slice(), h = this.inlineNames.slice(), c = this.endLeafBlock.slice(), f = this.wrappers;
    if (Bi(t.defineNodes)) {
      n = Object.assign({}, n);
      let d = i.types.slice(), O;
      for (let p of t.defineNodes) {
        let { name: m, block: g, composite: b, style: S } = typeof p == "string" ? { name: p } : p;
        if (d.some((x) => x.name == m))
          continue;
        b && (n[d.length] = (x, v, $) => b(v, $, x.value));
        let k = d.length, Q = b ? ["Block", "BlockContext"] : g ? k >= w.ATXHeading1 && k <= w.SetextHeading2 ? ["Block", "LeafBlock", "Heading"] : ["Block", "LeafBlock"] : void 0;
        d.push(ae.define({
          id: k,
          name: m,
          props: Q && [[X.group, Q]]
        })), S && (O || (O = {}), Array.isArray(S) || S instanceof je ? O[m] = S : Object.assign(O, S));
      }
      i = new $r(d), O && (i = i.extend(ii(O)));
    }
    if (Bi(t.props) && (i = i.extend(...t.props)), Bi(t.remove))
      for (let d of t.remove) {
        let O = this.blockNames.indexOf(d), p = this.inlineNames.indexOf(d);
        O > -1 && (s[O] = o[O] = void 0), p > -1 && (a[p] = void 0);
      }
    if (Bi(t.parseBlock))
      for (let d of t.parseBlock) {
        let O = l.indexOf(d.name);
        if (O > -1)
          s[O] = d.parse, o[O] = d.leaf;
        else {
          let p = d.before ? sn(l, d.before) : d.after ? sn(l, d.after) + 1 : l.length - 1;
          s.splice(p, 0, d.parse), o.splice(p, 0, d.leaf), l.splice(p, 0, d.name);
        }
        d.endLeaf && c.push(d.endLeaf);
      }
    if (Bi(t.parseInline))
      for (let d of t.parseInline) {
        let O = h.indexOf(d.name);
        if (O > -1)
          a[O] = d.parse;
        else {
          let p = d.before ? sn(h, d.before) : d.after ? sn(h, d.after) + 1 : h.length - 1;
          a.splice(p, 0, d.parse), h.splice(p, 0, d.name);
        }
      }
    return t.wrap && (f = f.concat(t.wrap)), new ss(i, s, o, l, c, n, a, h, f);
  }
  /// @internal
  getNodeType(e) {
    let t = this.nodeTypes[e];
    if (t == null)
      throw new RangeError(`Unknown node type '${e}'`);
    return t;
  }
  /// Parse the given piece of inline text at the given offset,
  /// returning an array of [`Element`](#Element) objects representing
  /// the inline content.
  parseInline(e, t) {
    let i = new KS(this, e, t);
    e: for (let n = t; n < i.end; ) {
      let s = i.char(n);
      for (let o of this.inlineParsers)
        if (o) {
          let l = o(i, s, n);
          if (l >= 0) {
            n = l;
            continue e;
          }
        }
      n++;
    }
    return i.resolveMarkers(0);
  }
}
function Bi(r) {
  return r != null && r.length > 0;
}
function Bo(r) {
  if (!Array.isArray(r))
    return r;
  if (r.length == 0)
    return null;
  let e = Bo(r[0]);
  if (r.length == 1)
    return e;
  let t = Bo(r.slice(1));
  if (!t || !e)
    return e || t;
  let i = (o, l) => (o || vi).concat(l || vi), n = e.wrap, s = t.wrap;
  return {
    props: i(e.props, t.props),
    defineNodes: i(e.defineNodes, t.defineNodes),
    parseBlock: i(e.parseBlock, t.parseBlock),
    parseInline: i(e.parseInline, t.parseInline),
    remove: i(e.remove, t.remove),
    wrap: n ? s ? (o, l, a, h) => n(s(o, l, a, h), l, a, h) : n : s
  };
}
function sn(r, e) {
  let t = r.indexOf(e);
  if (t < 0)
    throw new RangeError(`Position specified relative to unknown parser ${e}`);
  return t;
}
let $d = [ae.none];
for (let r = 1, e; e = w[r]; r++)
  $d[r] = ae.define({
    id: r,
    name: e,
    props: r >= w.Escape ? [] : [[X.group, r in md ? ["Block", "BlockContext"] : ["Block", "LeafBlock"]]],
    top: e == "Document"
  });
const vi = [];
class vd {
  constructor(e) {
    this.nodeSet = e, this.content = [], this.nodes = [];
  }
  write(e, t, i, n = 0) {
    return this.content.push(e, t, i, 4 + n * 4), this;
  }
  writeElements(e, t = 0) {
    for (let i of e)
      i.writeTo(this, t);
    return this;
  }
  finish(e, t) {
    return _.build({
      buffer: this.content,
      nodeSet: this.nodeSet,
      reused: this.nodes,
      topID: e,
      length: t
    });
  }
}
class xr {
  /// @internal
  constructor(e, t, i, n = vi) {
    this.type = e, this.from = t, this.to = i, this.children = n;
  }
  /// @internal
  writeTo(e, t) {
    let i = e.content.length;
    e.writeElements(this.children, t), e.content.push(this.type, this.from + t, this.to + t, e.content.length + 4 - i);
  }
  /// @internal
  toTree(e) {
    return new vd(e).writeElements(this.children, -this.from).finish(this.type, this.to - this.from);
  }
}
class Cd {
  constructor(e, t) {
    this.tree = e, this.from = t;
  }
  get to() {
    return this.from + this.tree.length;
  }
  get type() {
    return this.tree.type.id;
  }
  get children() {
    return vi;
  }
  writeTo(e, t) {
    e.nodes.push(this.tree), e.content.push(e.nodes.length - 1, this.from + t, this.to + t, -1);
  }
  toTree() {
    return this.tree;
  }
}
function V(r, e, t, i) {
  return new xr(r, e, t, i);
}
const Zd = { resolve: "Emphasis", mark: "EmphasisMark" }, Td = { resolve: "Emphasis", mark: "EmphasisMark" }, oi = {}, zo = {};
class qe {
  constructor(e, t, i, n) {
    this.type = e, this.from = t, this.to = i, this.side = n;
  }
}
const ec = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
let kr = /[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/;
try {
  kr = new RegExp("[\\p{Pc}|\\p{Pd}|\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}]", "u");
} catch {
}
const Bs = {
  Escape(r, e, t) {
    if (e != 92 || t == r.end - 1)
      return -1;
    let i = r.char(t + 1);
    for (let n = 0; n < ec.length; n++)
      if (ec.charCodeAt(n) == i)
        return r.append(V(w.Escape, t, t + 2));
    return -1;
  },
  Entity(r, e, t) {
    if (e != 38)
      return -1;
    let i = /^(?:#\d+|#x[a-f\d]+|\w+);/i.exec(r.slice(t + 1, t + 31));
    return i ? r.append(V(w.Entity, t, t + 1 + i[0].length)) : -1;
  },
  InlineCode(r, e, t) {
    if (e != 96 || t && r.char(t - 1) == 96)
      return -1;
    let i = t + 1;
    for (; i < r.end && r.char(i) == 96; )
      i++;
    let n = i - t, s = 0;
    for (; i < r.end; i++)
      if (r.char(i) == 96) {
        if (s++, s == n && r.char(i + 1) != 96)
          return r.append(V(w.InlineCode, t, i + 1, [
            V(w.CodeMark, t, t + n),
            V(w.CodeMark, i + 1 - n, i + 1)
          ]));
      } else
        s = 0;
    return -1;
  },
  HTMLTag(r, e, t) {
    if (e != 60 || t == r.end - 1)
      return -1;
    let i = r.slice(t + 1, r.end), n = /^(?:[a-z][-\w+.]+:[^\s>]+|[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*)>/i.exec(i);
    if (n)
      return r.append(V(w.Autolink, t, t + 1 + n[0].length, [
        V(w.LinkMark, t, t + 1),
        // url[0] includes the closing bracket, so exclude it from this slice
        V(w.URL, t + 1, t + n[0].length),
        V(w.LinkMark, t + n[0].length, t + 1 + n[0].length)
      ]));
    let s = /^!--[^>](?:-[^-]|[^-])*?-->/i.exec(i);
    if (s)
      return r.append(V(w.Comment, t, t + 1 + s[0].length));
    let o = /^\?[^]*?\?>/.exec(i);
    if (o)
      return r.append(V(w.ProcessingInstruction, t, t + 1 + o[0].length));
    let l = /^(?:![A-Z][^]*?>|!\[CDATA\[[^]*?\]\]>|\/\s*[a-zA-Z][\w-]*\s*>|\s*[a-zA-Z][\w-]*(\s+[a-zA-Z:_][\w-.:]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*(\/\s*)?>)/.exec(i);
    return l ? r.append(V(w.HTMLTag, t, t + 1 + l[0].length)) : -1;
  },
  Emphasis(r, e, t) {
    if (e != 95 && e != 42)
      return -1;
    let i = t + 1;
    for (; r.char(i) == e; )
      i++;
    let n = r.slice(t - 1, t), s = r.slice(i, i + 1), o = kr.test(n), l = kr.test(s), a = /\s|^$/.test(n), h = /\s|^$/.test(s), c = !h && (!l || a || o), f = !a && (!o || h || l), d = c && (e == 42 || !f || o), O = f && (e == 42 || !c || l);
    return r.append(new qe(e == 95 ? Zd : Td, t, i, (d ? 1 : 0) | (O ? 2 : 0)));
  },
  HardBreak(r, e, t) {
    if (e == 92 && r.char(t + 1) == 10)
      return r.append(V(w.HardBreak, t, t + 2));
    if (e == 32) {
      let i = t + 1;
      for (; r.char(i) == 32; )
        i++;
      if (r.char(i) == 10 && i >= t + 2)
        return r.append(V(w.HardBreak, t, i + 1));
    }
    return -1;
  },
  Link(r, e, t) {
    return e == 91 ? r.append(new qe(
      oi,
      t,
      t + 1,
      1
      /* Mark.Open */
    )) : -1;
  },
  Image(r, e, t) {
    return e == 33 && r.char(t + 1) == 91 ? r.append(new qe(
      zo,
      t,
      t + 2,
      1
      /* Mark.Open */
    )) : -1;
  },
  LinkEnd(r, e, t) {
    if (e != 93)
      return -1;
    for (let i = r.parts.length - 1; i >= 0; i--) {
      let n = r.parts[i];
      if (n instanceof qe && (n.type == oi || n.type == zo)) {
        if (!n.side || r.skipSpace(n.to) == t && !/[(\[]/.test(r.slice(t + 1, t + 2)))
          return r.parts[i] = null, -1;
        let s = r.takeContent(i), o = r.parts[i] = HS(r, s, n.type == oi ? w.Link : w.Image, n.from, t + 1);
        if (n.type == oi)
          for (let l = 0; l < i; l++) {
            let a = r.parts[l];
            a instanceof qe && a.type == oi && (a.side = 0);
          }
        return o.to;
      }
    }
    return -1;
  }
};
function HS(r, e, t, i, n) {
  let { text: s } = r, o = r.char(n), l = n;
  if (e.unshift(V(w.LinkMark, i, i + (t == w.Image ? 2 : 1))), e.push(V(w.LinkMark, n - 1, n)), o == 40) {
    let a = r.skipSpace(n + 1), h = Ad(s, a - r.offset, r.offset), c;
    h && (a = r.skipSpace(h.to), a != h.to && (c = Rd(s, a - r.offset, r.offset), c && (a = r.skipSpace(c.to)))), r.char(a) == 41 && (e.push(V(w.LinkMark, n, n + 1)), l = a + 1, h && e.push(h), c && e.push(c), e.push(V(w.LinkMark, a, l)));
  } else if (o == 91) {
    let a = Xd(s, n - r.offset, r.offset, !1);
    a && (e.push(a), l = a.to);
  }
  return V(t, i, l, e);
}
function Ad(r, e, t) {
  if (r.charCodeAt(e) == 60) {
    for (let n = e + 1; n < r.length; n++) {
      let s = r.charCodeAt(n);
      if (s == 62)
        return V(w.URL, e + t, n + 1 + t);
      if (s == 60 || s == 10)
        return !1;
    }
    return null;
  } else {
    let n = 0, s = e;
    for (let o = !1; s < r.length; s++) {
      let l = r.charCodeAt(s);
      if (Ue(l))
        break;
      if (o)
        o = !1;
      else if (l == 40)
        n++;
      else if (l == 41) {
        if (!n)
          break;
        n--;
      } else l == 92 && (o = !0);
    }
    return s > e ? V(w.URL, e + t, s + t) : s == r.length ? null : !1;
  }
}
function Rd(r, e, t) {
  let i = r.charCodeAt(e);
  if (i != 39 && i != 34 && i != 40)
    return !1;
  let n = i == 40 ? 41 : i;
  for (let s = e + 1, o = !1; s < r.length; s++) {
    let l = r.charCodeAt(s);
    if (o)
      o = !1;
    else {
      if (l == n)
        return V(w.LinkTitle, e + t, s + 1 + t);
      l == 92 && (o = !0);
    }
  }
  return null;
}
function Xd(r, e, t, i) {
  for (let n = !1, s = e + 1, o = Math.min(r.length, s + 999); s < o; s++) {
    let l = r.charCodeAt(s);
    if (n)
      n = !1;
    else {
      if (l == 93)
        return i ? !1 : V(w.LinkLabel, e + t, s + 1 + t);
      if (i && !Ue(l) && (i = !1), l == 91)
        return !1;
      l == 92 && (n = !0);
    }
  }
  return null;
}
class KS {
  /// @internal
  constructor(e, t, i) {
    this.parser = e, this.text = t, this.offset = i, this.parts = [];
  }
  /// Get the character code at the given (document-relative)
  /// position.
  char(e) {
    return e >= this.end ? -1 : this.text.charCodeAt(e - this.offset);
  }
  /// The position of the end of this inline section.
  get end() {
    return this.offset + this.text.length;
  }
  /// Get a substring of this inline section. Again uses
  /// document-relative positions.
  slice(e, t) {
    return this.text.slice(e - this.offset, t - this.offset);
  }
  /// @internal
  append(e) {
    return this.parts.push(e), e.to;
  }
  /// Add a [delimiter](#DelimiterType) at this given position. `open`
  /// and `close` indicate whether this delimiter is opening, closing,
  /// or both. Returns the end of the delimiter, for convenient
  /// returning from [parse functions](#InlineParser.parse).
  addDelimiter(e, t, i, n, s) {
    return this.append(new qe(e, t, i, (n ? 1 : 0) | (s ? 2 : 0)));
  }
  /// Returns true when there is an unmatched link or image opening
  /// token before the current position.
  get hasOpenLink() {
    for (let e = this.parts.length - 1; e >= 0; e--) {
      let t = this.parts[e];
      if (t instanceof qe && (t.type == oi || t.type == zo))
        return !0;
    }
    return !1;
  }
  /// Add an inline element. Returns the end of the element.
  addElement(e) {
    return this.append(e);
  }
  /// Resolve markers between this.parts.length and from, wrapping matched markers in the
  /// appropriate node and updating the content of this.parts. @internal
  resolveMarkers(e) {
    for (let i = e; i < this.parts.length; i++) {
      let n = this.parts[i];
      if (!(n instanceof qe && n.type.resolve && n.side & 2))
        continue;
      let s = n.type == Zd || n.type == Td, o = n.to - n.from, l, a = i - 1;
      for (; a >= e; a--) {
        let m = this.parts[a];
        if (m instanceof qe && m.side & 1 && m.type == n.type && // Ignore emphasis delimiters where the character count doesn't match
        !(s && (n.side & 1 || m.side & 2) && (m.to - m.from + o) % 3 == 0 && ((m.to - m.from) % 3 || o % 3))) {
          l = m;
          break;
        }
      }
      if (!l)
        continue;
      let h = n.type.resolve, c = [], f = l.from, d = n.to;
      if (s) {
        let m = Math.min(2, l.to - l.from, o);
        f = l.to - m, d = n.from + m, h = m == 1 ? "Emphasis" : "StrongEmphasis";
      }
      l.type.mark && c.push(this.elt(l.type.mark, f, l.to));
      for (let m = a + 1; m < i; m++)
        this.parts[m] instanceof xr && c.push(this.parts[m]), this.parts[m] = null;
      n.type.mark && c.push(this.elt(n.type.mark, n.from, d));
      let O = this.elt(h, f, d, c);
      this.parts[a] = s && l.from != f ? new qe(l.type, l.from, f, l.side) : null, (this.parts[i] = s && n.to != d ? new qe(n.type, d, n.to, n.side) : null) ? this.parts.splice(i, 0, O) : this.parts[i] = O;
    }
    let t = [];
    for (let i = e; i < this.parts.length; i++) {
      let n = this.parts[i];
      n instanceof xr && t.push(n);
    }
    return t;
  }
  /// Find an opening delimiter of the given type. Returns `null` if
  /// no delimiter is found, or an index that can be passed to
  /// [`takeContent`](#InlineContext.takeContent) otherwise.
  findOpeningDelimiter(e) {
    for (let t = this.parts.length - 1; t >= 0; t--) {
      let i = this.parts[t];
      if (i instanceof qe && i.type == e)
        return t;
    }
    return null;
  }
  /// Remove all inline elements and delimiters starting from the
  /// given index (which you should get from
  /// [`findOpeningDelimiter`](#InlineContext.findOpeningDelimiter),
  /// resolve delimiters inside of them, and return them as an array
  /// of elements.
  takeContent(e) {
    let t = this.resolveMarkers(e);
    return this.parts.length = e, t;
  }
  /// Skip space after the given (document) position, returning either
  /// the position of the next non-space character or the end of the
  /// section.
  skipSpace(e) {
    return er(this.text, e - this.offset) + this.offset;
  }
  elt(e, t, i, n) {
    return typeof e == "string" ? V(this.parser.getNodeType(e), t, i, n) : new Cd(e, t);
  }
}
function Lo(r, e) {
  if (!e.length)
    return r;
  if (!r.length)
    return e;
  let t = r.slice(), i = 0;
  for (let n of e) {
    for (; i < t.length && t[i].to < n.to; )
      i++;
    if (i < t.length && t[i].from < n.from) {
      let s = t[i];
      s instanceof xr && (t[i] = new xr(s.type, s.from, s.to, Lo(s.children, [n])));
    } else
      t.splice(i++, 0, n);
  }
  return t;
}
const JS = [w.CodeBlock, w.ListItem, w.OrderedList, w.BulletList];
class ey {
  constructor(e, t) {
    this.fragments = e, this.input = t, this.i = 0, this.fragment = null, this.fragmentEnd = -1, this.cursor = null, e.length && (this.fragment = e[this.i++]);
  }
  nextFragment() {
    this.fragment = this.i < this.fragments.length ? this.fragments[this.i++] : null, this.cursor = null, this.fragmentEnd = -1;
  }
  moveTo(e, t) {
    for (; this.fragment && this.fragment.to <= e; )
      this.nextFragment();
    if (!this.fragment || this.fragment.from > (e ? e - 1 : 0))
      return !1;
    if (this.fragmentEnd < 0) {
      let s = this.fragment.to;
      for (; s > 0 && this.input.read(s - 1, s) != `
`; )
        s--;
      this.fragmentEnd = s ? s - 1 : 0;
    }
    let i = this.cursor;
    i || (i = this.cursor = this.fragment.tree.cursor(), i.firstChild());
    let n = e + this.fragment.offset;
    for (; i.to <= n; )
      if (!i.parent())
        return !1;
    for (; ; ) {
      if (i.from >= n)
        return this.fragment.from <= t;
      if (!i.childAfter(n))
        return !1;
    }
  }
  matches(e) {
    let t = this.cursor.tree;
    return t && t.prop(X.contextHash) == e;
  }
  takeNodes(e) {
    let t = this.cursor, i = this.fragment.offset, n = this.fragmentEnd - (this.fragment.openEnd ? 1 : 0), s = e.absoluteLineStart, o = s, l = e.block.children.length, a = o, h = l;
    for (; ; ) {
      if (t.to - i > n) {
        if (t.type.isAnonymous && t.firstChild())
          continue;
        break;
      }
      let c = Md(t.from - i, e.ranges);
      if (t.to - i <= e.ranges[e.rangeI].to)
        e.addNode(t.tree, c);
      else {
        let f = new _(e.parser.nodeSet.types[w.Paragraph], [], [], 0, e.block.hashProp);
        e.reusePlaceholders.set(f, t.tree), e.addNode(f, c);
      }
      if (t.type.is("Block") && (JS.indexOf(t.type.id) < 0 ? (o = t.to - i, l = e.block.children.length) : (o = a, l = h, a = t.to - i, h = e.block.children.length)), !t.nextSibling())
        break;
    }
    for (; e.block.children.length > l; )
      e.block.children.pop(), e.block.positions.pop();
    return o - s;
  }
}
function Md(r, e) {
  let t = r;
  for (let i = 1; i < e.length; i++) {
    let n = e[i - 1].to, s = e[i].from;
    n < r && (t -= s - n);
  }
  return t;
}
const ty = ii({
  "Blockquote/...": u.quote,
  HorizontalRule: u.contentSeparator,
  "ATXHeading1/... SetextHeading1/...": u.heading1,
  "ATXHeading2/... SetextHeading2/...": u.heading2,
  "ATXHeading3/...": u.heading3,
  "ATXHeading4/...": u.heading4,
  "ATXHeading5/...": u.heading5,
  "ATXHeading6/...": u.heading6,
  "Comment CommentBlock": u.comment,
  Escape: u.escape,
  Entity: u.character,
  "Emphasis/...": u.emphasis,
  "StrongEmphasis/...": u.strong,
  "Link/... Image/...": u.link,
  "OrderedList/... BulletList/...": u.list,
  "BlockQuote/...": u.quote,
  "InlineCode CodeText": u.monospace,
  "URL Autolink": u.url,
  "HeaderMark HardBreak QuoteMark ListMark LinkMark EmphasisMark CodeMark": u.processingInstruction,
  "CodeInfo LinkLabel": u.labelName,
  LinkTitle: u.string,
  Paragraph: u.content
}), iy = new ss(new $r($d).extend(ty), Object.keys(nn).map((r) => nn[r]), Object.keys(nn).map((r) => IS[r]), Object.keys(nn), jS, md, Object.keys(Bs).map((r) => Bs[r]), Object.keys(Bs), []);
function ry(r, e, t) {
  let i = [];
  for (let n = r.firstChild, s = e; ; n = n.nextSibling) {
    let o = n ? n.from : t;
    if (o > s && i.push({ from: s, to: o }), !n)
      break;
    s = n.to;
  }
  return i;
}
function ny(r) {
  let { codeParser: e, htmlParser: t } = r;
  return { wrap: Zc((n, s) => {
    let o = n.type.id;
    if (e && (o == w.CodeBlock || o == w.FencedCode)) {
      let l = "";
      if (o == w.FencedCode) {
        let h = n.node.getChild(w.CodeInfo);
        h && (l = s.read(h.from, h.to));
      }
      let a = e(l);
      if (a)
        return { parser: a, overlay: (h) => h.type.id == w.CodeText };
    } else if (t && (o == w.HTMLBlock || o == w.HTMLTag))
      return { parser: t, overlay: ry(n.node, n.from, n.to) };
    return null;
  }) };
}
const sy = { resolve: "Strikethrough", mark: "StrikethroughMark" }, oy = {
  defineNodes: [{
    name: "Strikethrough",
    style: { "Strikethrough/...": u.strikethrough }
  }, {
    name: "StrikethroughMark",
    style: u.processingInstruction
  }],
  parseInline: [{
    name: "Strikethrough",
    parse(r, e, t) {
      if (e != 126 || r.char(t + 1) != 126 || r.char(t + 2) == 126)
        return -1;
      let i = r.slice(t - 1, t), n = r.slice(t + 2, t + 3), s = /\s|^$/.test(i), o = /\s|^$/.test(n), l = kr.test(i), a = kr.test(n);
      return r.addDelimiter(sy, t, t + 2, !o && (!a || s || l), !s && (!l || o || a));
    },
    after: "Emphasis"
  }]
};
function tr(r, e, t = 0, i, n = 0) {
  let s = 0, o = !0, l = -1, a = -1, h = !1, c = () => {
    i.push(r.elt("TableCell", n + l, n + a, r.parser.parseInline(e.slice(l, a), n + l)));
  };
  for (let f = t; f < e.length; f++) {
    let d = e.charCodeAt(f);
    d == 124 && !h ? ((!o || l > -1) && s++, o = !1, i && (l > -1 && c(), i.push(r.elt("TableDelimiter", f + n, f + n + 1))), l = a = -1) : (h || d != 32 && d != 9) && (l < 0 && (l = f), a = f + 1), h = !h && d == 92;
  }
  return l > -1 && (s++, i && c()), s;
}
function tc(r, e) {
  for (let t = e; t < r.length; t++) {
    let i = r.charCodeAt(t);
    if (i == 124)
      return !0;
    i == 92 && t++;
  }
  return !1;
}
const Ed = /^\|?(\s*:?-+:?\s*\|)+(\s*:?-+:?\s*)?$/;
class ic {
  constructor() {
    this.rows = null;
  }
  nextLine(e, t, i) {
    if (this.rows == null) {
      this.rows = !1;
      let n;
      if ((t.next == 45 || t.next == 58 || t.next == 124) && Ed.test(n = t.text.slice(t.pos))) {
        let s = [];
        tr(e, i.content, 0, s, i.start) == tr(e, n, t.pos) && (this.rows = [
          e.elt("TableHeader", i.start, i.start + i.content.length, s),
          e.elt("TableDelimiter", e.lineStart + t.pos, e.lineStart + t.text.length)
        ]);
      }
    } else if (this.rows) {
      let n = [];
      tr(e, t.text, t.pos, n, e.lineStart), this.rows.push(e.elt("TableRow", e.lineStart + t.pos, e.lineStart + t.text.length, n));
    }
    return !1;
  }
  finish(e, t) {
    return this.rows ? (e.addLeafElement(t, e.elt("Table", t.start, t.start + t.content.length, this.rows)), !0) : !1;
  }
}
const ly = {
  defineNodes: [
    { name: "Table", block: !0 },
    { name: "TableHeader", style: { "TableHeader/...": u.heading } },
    "TableRow",
    { name: "TableCell", style: u.content },
    { name: "TableDelimiter", style: u.processingInstruction }
  ],
  parseBlock: [{
    name: "Table",
    leaf(r, e) {
      return tc(e.content, 0) ? new ic() : null;
    },
    endLeaf(r, e, t) {
      if (t.parsers.some((n) => n instanceof ic) || !tc(e.text, e.basePos))
        return !1;
      let i = r.scanLine(r.absoluteLineEnd + 1).text;
      return Ed.test(i) && tr(r, e.text, e.basePos) == tr(r, i, e.basePos);
    },
    before: "SetextHeading"
  }]
};
class ay {
  nextLine() {
    return !1;
  }
  finish(e, t) {
    return e.addLeafElement(t, e.elt("Task", t.start, t.start + t.content.length, [
      e.elt("TaskMarker", t.start, t.start + 3),
      ...e.parser.parseInline(t.content.slice(3), t.start + 3)
    ])), !0;
  }
}
const hy = {
  defineNodes: [
    { name: "Task", block: !0, style: u.list },
    { name: "TaskMarker", style: u.atom }
  ],
  parseBlock: [{
    name: "TaskList",
    leaf(r, e) {
      return /^\[[ xX]\][ \t]/.test(e.content) && r.parentType().name == "ListItem" ? new ay() : null;
    },
    after: "SetextHeading"
  }]
}, rc = /(www\.)|(https?:\/\/)|([\w.+-]+@)|(mailto:|xmpp:)/gy, nc = /[\w-]+(\.[\w-]+)+(\/[^\s<]*)?/gy, cy = /[\w-]+\.[\w-]+($|\/)/, sc = /[\w.+-]+@[\w-]+(\.[\w.-]+)+/gy, oc = /\/[a-zA-Z\d@.]+/gy;
function lc(r, e, t, i) {
  let n = 0;
  for (let s = e; s < t; s++)
    r[s] == i && n++;
  return n;
}
function fy(r, e) {
  nc.lastIndex = e;
  let t = nc.exec(r);
  if (!t || cy.exec(t[0])[0].indexOf("_") > -1)
    return -1;
  let i = e + t[0].length;
  for (; ; ) {
    let n = r[i - 1], s;
    if (/[?!.,:*_~]/.test(n) || n == ")" && lc(r, e, i, ")") > lc(r, e, i, "("))
      i--;
    else if (n == ";" && (s = /&(?:#\d+|#x[a-f\d]+|\w+);$/.exec(r.slice(e, i))))
      i = e + s.index;
    else
      break;
  }
  return i;
}
function ac(r, e) {
  sc.lastIndex = e;
  let t = sc.exec(r);
  if (!t)
    return -1;
  let i = t[0][t[0].length - 1];
  return i == "_" || i == "-" ? -1 : e + t[0].length - (i == "." ? 1 : 0);
}
const uy = {
  parseInline: [{
    name: "Autolink",
    parse(r, e, t) {
      let i = t - r.offset;
      rc.lastIndex = i;
      let n = rc.exec(r.text), s = -1;
      if (!n)
        return -1;
      if (n[1] || n[2]) {
        if (s = fy(r.text, i + n[0].length), s > -1 && r.hasOpenLink) {
          let o = /([^\[\]]|\[[^\]]*\])*/.exec(r.text.slice(i, s));
          s = i + o[0].length;
        }
      } else n[3] ? s = ac(r.text, i) : (s = ac(r.text, i + n[0].length), s > -1 && n[0] == "xmpp:" && (oc.lastIndex = s, n = oc.exec(r.text), n && (s = n.index + n[0].length)));
      return s < 0 ? -1 : (r.addElement(r.elt("URL", t, s + r.offset)), s + r.offset);
    }
  }]
}, dy = [ly, hy, oy, uy];
function Wd(r, e, t) {
  return (i, n, s) => {
    if (n != r || i.char(s + 1) == r)
      return -1;
    let o = [i.elt(t, s, s + 1)];
    for (let l = s + 1; l < i.end; l++) {
      let a = i.char(l);
      if (a == r)
        return i.addElement(i.elt(e, s, l + 1, o.concat(i.elt(t, l, l + 1))));
      if (a == 92 && o.push(i.elt("Escape", l, l++ + 2)), Ue(a))
        break;
    }
    return -1;
  };
}
const Oy = {
  defineNodes: [
    { name: "Superscript", style: u.special(u.content) },
    { name: "SuperscriptMark", style: u.processingInstruction }
  ],
  parseInline: [{
    name: "Superscript",
    parse: Wd(94, "Superscript", "SuperscriptMark")
  }]
}, py = {
  defineNodes: [
    { name: "Subscript", style: u.special(u.content) },
    { name: "SubscriptMark", style: u.processingInstruction }
  ],
  parseInline: [{
    name: "Subscript",
    parse: Wd(126, "Subscript", "SubscriptMark")
  }]
}, my = {
  defineNodes: [{ name: "Emoji", style: u.character }],
  parseInline: [{
    name: "Emoji",
    parse(r, e, t) {
      let i;
      return e != 58 || !(i = /^[a-zA-Z_0-9]+:/.exec(r.slice(t + 1, r.end))) ? -1 : r.addElement(r.elt("Emoji", t, t + 1 + i[0].length));
    }
  }]
}, Yd = /* @__PURE__ */ Sl({ commentTokens: { block: { open: "<!--", close: "-->" } } }), Dd = /* @__PURE__ */ new X(), qd = /* @__PURE__ */ iy.configure({
  props: [
    /* @__PURE__ */ ri.add((r) => !r.is("Block") || r.is("Document") || No(r) != null || gy(r) ? void 0 : (e, t) => ({ from: t.doc.lineAt(e.from).to, to: e.to })),
    /* @__PURE__ */ Dd.add(No),
    /* @__PURE__ */ Ti.add({
      Document: () => null
    }),
    /* @__PURE__ */ Ut.add({
      Document: Yd
    })
  ]
});
function No(r) {
  let e = /^(?:ATX|Setext)Heading(\d)$/.exec(r.name);
  return e ? +e[1] : void 0;
}
function gy(r) {
  return r.name == "OrderedList" || r.name == "BulletList";
}
function by(r, e) {
  let t = r;
  for (; ; ) {
    let i = t.nextSibling, n;
    if (!i || (n = No(i.type)) != null && n <= e)
      break;
    t = i;
  }
  return t.to;
}
const Sy = /* @__PURE__ */ Qu.of((r, e, t) => {
  for (let i = H(r).resolveInner(t, -1); i && !(i.from < e); i = i.parent) {
    let n = i.type.prop(Dd);
    if (n == null)
      continue;
    let s = by(i, n);
    if (s > t)
      return { from: t, to: s };
  }
  return null;
});
function Wl(r) {
  return new ze(Yd, r, [Sy], "markdown");
}
const yy = /* @__PURE__ */ Wl(qd), xy = /* @__PURE__ */ qd.configure([dy, py, Oy, my, {
  props: [
    /* @__PURE__ */ ri.add({
      Table: (r, e) => ({ from: e.doc.lineAt(r.from).to, to: r.to })
    })
  ]
}]), Vd = /* @__PURE__ */ Wl(xy);
function ky(r, e) {
  return (t) => {
    if (t && r) {
      let i = null;
      if (t = /\S*/.exec(t)[0], typeof r == "function" ? i = r(t) : i = qn.matchLanguageName(r, t, !0), i instanceof qn)
        return i.support ? i.support.language.parser : pr.getSkippingParser(i.load());
      if (i)
        return i.parser;
    }
    return e ? e.parser : null;
  };
}
class on {
  constructor(e, t, i, n, s, o, l) {
    this.node = e, this.from = t, this.to = i, this.spaceBefore = n, this.spaceAfter = s, this.type = o, this.item = l;
  }
  blank(e, t = !0) {
    let i = this.spaceBefore + (this.node.name == "Blockquote" ? ">" : "");
    if (e != null) {
      for (; i.length < e; )
        i += " ";
      return i;
    } else {
      for (let n = this.to - this.from - i.length - this.spaceAfter.length; n > 0; n--)
        i += " ";
      return i + (t ? this.spaceAfter : "");
    }
  }
  marker(e, t) {
    let i = this.node.name == "OrderedList" ? String(+zd(this.item, e)[2] + t) : "";
    return this.spaceBefore + i + this.type + this.spaceAfter;
  }
}
function Bd(r, e) {
  let t = [];
  for (let n = r; n && n.name != "Document"; n = n.parent)
    (n.name == "ListItem" || n.name == "Blockquote" || n.name == "FencedCode") && t.push(n);
  let i = [];
  for (let n = t.length - 1; n >= 0; n--) {
    let s = t[n], o, l = e.lineAt(s.from), a = s.from - l.from;
    if (s.name == "FencedCode")
      i.push(new on(s, a, a, "", "", "", null));
    else if (s.name == "Blockquote" && (o = /^ *>( ?)/.exec(l.text.slice(a))))
      i.push(new on(s, a, a + o[0].length, "", o[1], ">", null));
    else if (s.name == "ListItem" && s.parent.name == "OrderedList" && (o = /^( *)\d+([.)])( *)/.exec(l.text.slice(a)))) {
      let h = o[3], c = o[0].length;
      h.length >= 4 && (h = h.slice(0, h.length - 4), c -= 4), i.push(new on(s.parent, a, a + c, o[1], h, o[2], s));
    } else if (s.name == "ListItem" && s.parent.name == "BulletList" && (o = /^( *)([-+*])( {1,4}\[[ xX]\])?( +)/.exec(l.text.slice(a)))) {
      let h = o[4], c = o[0].length;
      h.length > 4 && (h = h.slice(0, h.length - 4), c -= 4);
      let f = o[2];
      o[3] && (f += o[3].replace(/[xX]/, " ")), i.push(new on(s.parent, a, a + c, o[1], h, f, s));
    }
  }
  return i;
}
function zd(r, e) {
  return /^(\s*)(\d+)(?=[.)])/.exec(e.sliceString(r.from, r.from + 10));
}
function zs(r, e, t, i = 0) {
  for (let n = -1, s = r; ; ) {
    if (s.name == "ListItem") {
      let l = zd(s, e), a = +l[2];
      if (n >= 0) {
        if (a != n + 1)
          return;
        t.push({ from: s.from + l[1].length, to: s.from + l[0].length, insert: String(n + 2 + i) });
      }
      n = a;
    }
    let o = s.nextSibling;
    if (!o)
      break;
    s = o;
  }
}
function Yl(r, e) {
  let t = /^[ \t]*/.exec(r)[0].length;
  if (!t || e.facet(Rr) != "	")
    return r;
  let i = Ge(r, 4, t), n = "";
  for (let s = i; s > 0; )
    s >= 4 ? (n += "	", s -= 4) : (n += " ", s--);
  return n + r.slice(t);
}
const Qy = ({ state: r, dispatch: e }) => {
  let t = H(r), { doc: i } = r, n = null, s = r.changeByRange((o) => {
    if (!o.empty || !Vd.isActiveAt(r, o.from))
      return n = { range: o };
    let l = o.from, a = i.lineAt(l), h = Bd(t.resolveInner(l, -1), i);
    for (; h.length && h[h.length - 1].from > l - a.from; )
      h.pop();
    if (!h.length)
      return n = { range: o };
    let c = h[h.length - 1];
    if (c.to - c.spaceAfter.length > l - a.from)
      return n = { range: o };
    let f = l >= c.to - c.spaceAfter.length && !/\S/.test(a.text.slice(c.to));
    if (c.item && f) {
      let g = c.node.firstChild, b = c.node.getChild("ListItem", "ListItem");
      if (g.to >= l || b && b.to < l || a.from > 0 && !/[^\s>]/.test(i.lineAt(a.from - 1).text)) {
        let S = h.length > 1 ? h[h.length - 2] : null, k, Q = "";
        S && S.item ? (k = a.from + S.from, Q = S.marker(i, 1)) : k = a.from + (S ? S.to : 0);
        let x = [{ from: k, to: l, insert: Q }];
        return c.node.name == "OrderedList" && zs(c.item, i, x, -2), S && S.node.name == "OrderedList" && zs(S.item, i, x), { range: y.cursor(k + Q.length), changes: x };
      } else {
        let S = cc(h, r, a);
        return {
          range: y.cursor(l + S.length + 1),
          changes: { from: a.from, insert: S + r.lineBreak }
        };
      }
    }
    if (c.node.name == "Blockquote" && f && a.from) {
      let g = i.lineAt(a.from - 1), b = />\s*$/.exec(g.text);
      if (b && b.index == c.from) {
        let S = r.changes([
          { from: g.from + b.index, to: g.to },
          { from: a.from + c.from, to: a.to }
        ]);
        return { range: o.map(S), changes: S };
      }
    }
    let d = [];
    c.node.name == "OrderedList" && zs(c.item, i, d);
    let O = c.item && c.item.from < a.from, p = "";
    if (!O || /^[\s\d.)\-+*>]*/.exec(a.text)[0].length >= c.to)
      for (let g = 0, b = h.length - 1; g <= b; g++)
        p += g == b && !O ? h[g].marker(i, 1) : h[g].blank(g < b ? Ge(a.text, 4, h[g + 1].from) - p.length : null);
    let m = l;
    for (; m > a.from && /\s/.test(a.text.charAt(m - a.from - 1)); )
      m--;
    return p = Yl(p, r), wy(c.node, r.doc) && (p = cc(h, r, a) + r.lineBreak + p), d.push({ from: m, to: l, insert: r.lineBreak + p }), { range: y.cursor(m + p.length + 1), changes: d };
  });
  return n ? !1 : (e(r.update(s, { scrollIntoView: !0, userEvent: "input" })), !0);
};
function hc(r) {
  return r.name == "QuoteMark" || r.name == "ListMark";
}
function wy(r, e) {
  if (r.name != "OrderedList" && r.name != "BulletList")
    return !1;
  let t = r.firstChild, i = r.getChild("ListItem", "ListItem");
  if (!i)
    return !1;
  let n = e.lineAt(t.to), s = e.lineAt(i.from), o = /^[\s>]*$/.test(n.text);
  return n.number + (o ? 0 : 1) < s.number;
}
function cc(r, e, t) {
  let i = "";
  for (let n = 0, s = r.length - 2; n <= s; n++)
    i += r[n].blank(n < s ? Ge(t.text, 4, r[n + 1].from) - i.length : null, n < s);
  return Yl(i, e);
}
function Py(r, e) {
  let t = r.resolveInner(e, -1), i = e;
  hc(t) && (i = t.from, t = t.parent);
  for (let n; n = t.childBefore(i); )
    if (hc(n))
      i = n.from;
    else if (n.name == "OrderedList" || n.name == "BulletList")
      t = n.lastChild, i = t.to;
    else
      break;
  return t;
}
const $y = ({ state: r, dispatch: e }) => {
  let t = H(r), i = null, n = r.changeByRange((s) => {
    let o = s.from, { doc: l } = r;
    if (s.empty && Vd.isActiveAt(r, s.from)) {
      let a = l.lineAt(o), h = Bd(Py(t, o), l);
      if (h.length) {
        let c = h[h.length - 1], f = c.to - c.spaceAfter.length + (c.spaceAfter ? 1 : 0);
        if (o - a.from > f && !/\S/.test(a.text.slice(f, o - a.from)))
          return {
            range: y.cursor(a.from + f),
            changes: { from: a.from + f, to: o }
          };
        if (o - a.from == f && // Only apply this if we're on the line that has the
        // construct's syntax, or there's only indentation in the
        // target range
        (!c.item || a.from <= c.item.from || !/\S/.test(a.text.slice(0, c.to)))) {
          let d = a.from + c.from;
          if (c.item && c.node.from < c.item.from && /\S/.test(a.text.slice(c.from, c.to))) {
            let O = c.blank(Ge(a.text, 4, c.to) - Ge(a.text, 4, c.from));
            return d == a.from && (O = Yl(O, r)), {
              range: y.cursor(d + O.length),
              changes: { from: d, to: a.from + c.to, insert: O }
            };
          }
          if (d < o)
            return { range: y.cursor(d), changes: { from: d, to: o } };
        }
      }
    }
    return i = { range: s };
  });
  return i ? !1 : (e(r.update(n, { scrollIntoView: !0, userEvent: "delete" })), !0);
}, vy = [
  { key: "Enter", run: Qy },
  { key: "Backspace", run: $y }
], _o = /* @__PURE__ */ pd({ matchClosingTags: !1 });
function Cy(r = {}) {
  let { codeLanguages: e, defaultCodeLanguage: t, addKeymap: i = !0, base: { parser: n } = yy, completeHTMLTags: s = !0 } = r;
  if (!(n instanceof ss))
    throw new RangeError("Base parser provided to `markdown` should be a Markdown parser");
  let o = r.extensions ? [r.extensions] : [], l = [_o.support], a;
  t instanceof wi ? (l.push(t.support), a = t.language) : t && (a = t);
  let h = e || a ? ky(e, a) : void 0;
  o.push(ny({ codeParser: h, htmlParser: _o.language.parser })), i && l.push(xt.high(Tr.of(vy)));
  let c = Wl(n.configure(o));
  return s && l.push(c.data.of({ autocomplete: Zy })), new wi(c, l);
}
function Zy(r) {
  let { state: e, pos: t } = r, i = /<[:\-\.\w\u00b7-\uffff]*$/.exec(e.sliceDoc(t - 25, t));
  if (!i)
    return null;
  let n = H(e).resolveInner(t, -1);
  for (; n && !n.type.isTop; ) {
    if (n.name == "CodeBlock" || n.name == "FencedCode" || n.name == "ProcessingInstructionBlock" || n.name == "CommentBlock" || n.name == "Link" || n.name == "Image")
      return null;
    n = n.parent;
  }
  return {
    from: t - i[0].length,
    to: t,
    options: Ty(),
    validFor: /^<[:\-\.\w\u00b7-\uffff]*$/
  };
}
let Ls = null;
function Ty() {
  if (Ls)
    return Ls;
  let r = WS(new wl(B.create({ extensions: _o }), 0, !0));
  return Ls = r ? r.options : [];
}
var fc = 1024 * 1024;
function Ay(r, e, t) {
  let i, n = 0;
  return new ReadableStream({
    async start() {
      i = await r.open(e, 1, 2, void 0, { signal: t });
    },
    async pull(o) {
      try {
        const l = await r.read(i, n, fc, { signal: t });
        n += fc, l.byteLength > 0 ? o.enqueue(l) : o.close();
      } catch {
        o.close();
      }
    },
    async cancel() {
      r.close(i);
    }
  });
}
async function Ry(r) {
  const e = r.getReader(), t = [];
  let i = 0;
  for (; ; ) {
    const { done: o, value: l } = await e.read();
    if (o)
      break;
    l && (t.push(l), i += l.length);
  }
  const n = new Uint8Array(i);
  let s = 0;
  for (const o of t)
    n.set(o, s), s += o.length;
  return n;
}
async function Xy(r, e) {
  const t = Ay(faraday.fs, r, e == null ? void 0 : e.signal);
  return Ry(t);
}
const My = (r) => {
  let { state: e } = r, t = e.doc.lineAt(e.selection.main.from), i = ql(r.state, t.from);
  return i.line ? Ey(r) : i.block ? Yy(r) : !1;
};
function Dl(r, e) {
  return ({ state: t, dispatch: i }) => {
    if (t.readOnly)
      return !1;
    let n = r(e, t);
    return n ? (i(t.update(n)), !0) : !1;
  };
}
const Ey = /* @__PURE__ */ Dl(
  Vy,
  0
  /* CommentOption.Toggle */
), Wy = /* @__PURE__ */ Dl(
  Ld,
  0
  /* CommentOption.Toggle */
), Yy = /* @__PURE__ */ Dl(
  (r, e) => Ld(r, e, qy(e)),
  0
  /* CommentOption.Toggle */
);
function ql(r, e) {
  let t = r.languageDataAt("commentTokens", e);
  return t.length ? t[0] : {};
}
const zi = 50;
function Dy(r, { open: e, close: t }, i, n) {
  let s = r.sliceDoc(i - zi, i), o = r.sliceDoc(n, n + zi), l = /\s*$/.exec(s)[0].length, a = /^\s*/.exec(o)[0].length, h = s.length - l;
  if (s.slice(h - e.length, h) == e && o.slice(a, a + t.length) == t)
    return {
      open: { pos: i - l, margin: l && 1 },
      close: { pos: n + a, margin: a && 1 }
    };
  let c, f;
  n - i <= 2 * zi ? c = f = r.sliceDoc(i, n) : (c = r.sliceDoc(i, i + zi), f = r.sliceDoc(n - zi, n));
  let d = /^\s*/.exec(c)[0].length, O = /\s*$/.exec(f)[0].length, p = f.length - O - t.length;
  return c.slice(d, d + e.length) == e && f.slice(p, p + t.length) == t ? {
    open: {
      pos: i + d + e.length,
      margin: /\s/.test(c.charAt(d + e.length)) ? 1 : 0
    },
    close: {
      pos: n - O - t.length,
      margin: /\s/.test(f.charAt(p - 1)) ? 1 : 0
    }
  } : null;
}
function qy(r) {
  let e = [];
  for (let t of r.selection.ranges) {
    let i = r.doc.lineAt(t.from), n = t.to <= i.to ? i : r.doc.lineAt(t.to), s = e.length - 1;
    s >= 0 && e[s].to > i.from ? e[s].to = n.to : e.push({ from: i.from + /^\s*/.exec(i.text)[0].length, to: n.to });
  }
  return e;
}
function Ld(r, e, t = e.selection.ranges) {
  let i = t.map((s) => ql(e, s.from).block);
  if (!i.every((s) => s))
    return null;
  let n = t.map((s, o) => Dy(e, i[o], s.from, s.to));
  if (r != 2 && !n.every((s) => s))
    return { changes: e.changes(t.map((s, o) => n[o] ? [] : [{ from: s.from, insert: i[o].open + " " }, { from: s.to, insert: " " + i[o].close }])) };
  if (r != 1 && n.some((s) => s)) {
    let s = [];
    for (let o = 0, l; o < n.length; o++)
      if (l = n[o]) {
        let a = i[o], { open: h, close: c } = l;
        s.push({ from: h.pos - a.open.length, to: h.pos + h.margin }, { from: c.pos - c.margin, to: c.pos + a.close.length });
      }
    return { changes: s };
  }
  return null;
}
function Vy(r, e, t = e.selection.ranges) {
  let i = [], n = -1;
  for (let { from: s, to: o } of t) {
    let l = i.length, a = 1e9, h = ql(e, s).line;
    if (h) {
      for (let c = s; c <= o; ) {
        let f = e.doc.lineAt(c);
        if (f.from > n && (s == o || o > f.from)) {
          n = f.from;
          let d = /^\s*/.exec(f.text)[0].length, O = d == f.length, p = f.text.slice(d, d + h.length) == h ? d : -1;
          d < f.text.length && d < a && (a = d), i.push({ line: f, comment: p, token: h, indent: d, empty: O, single: !1 });
        }
        c = f.to + 1;
      }
      if (a < 1e9)
        for (let c = l; c < i.length; c++)
          i[c].indent < i[c].line.text.length && (i[c].indent = a);
      i.length == l + 1 && (i[l].single = !0);
    }
  }
  if (r != 2 && i.some((s) => s.comment < 0 && (!s.empty || s.single))) {
    let s = [];
    for (let { line: l, token: a, indent: h, empty: c, single: f } of i)
      (f || !c) && s.push({ from: l.from + h, insert: a + " " });
    let o = e.changes(s);
    return { changes: o, selection: e.selection.map(o, 1) };
  } else if (r != 1 && i.some((s) => s.comment >= 0)) {
    let s = [];
    for (let { line: o, comment: l, token: a } of i)
      if (l >= 0) {
        let h = o.from + l, c = h + a.length;
        o.text[c - o.from] == " " && c++, s.push({ from: h, to: c });
      }
    return { changes: s };
  }
  return null;
}
const Uo = /* @__PURE__ */ kt.define(), By = /* @__PURE__ */ kt.define(), zy = /* @__PURE__ */ T.define(), Nd = /* @__PURE__ */ T.define({
  combine(r) {
    return ut(r, {
      minDepth: 100,
      newGroupDelay: 500,
      joinToEvent: (e, t) => t
    }, {
      minDepth: Math.max,
      newGroupDelay: Math.min,
      joinToEvent: (e, t) => (i, n) => e(i, n) || t(i, n)
    });
  }
}), _d = /* @__PURE__ */ he.define({
  create() {
    return ht.empty;
  },
  update(r, e) {
    let t = e.state.facet(Nd), i = e.annotation(Uo);
    if (i) {
      let a = Ze.fromTransaction(e, i.selection), h = i.side, c = h == 0 ? r.undone : r.done;
      return a ? c = In(c, c.length, t.minDepth, a) : c = jd(c, e.startState.selection), new ht(h == 0 ? i.rest : c, h == 0 ? c : i.rest);
    }
    let n = e.annotation(By);
    if ((n == "full" || n == "before") && (r = r.isolate()), e.annotation(ne.addToHistory) === !1)
      return e.changes.empty ? r : r.addMapping(e.changes.desc);
    let s = Ze.fromTransaction(e), o = e.annotation(ne.time), l = e.annotation(ne.userEvent);
    return s ? r = r.addChanges(s, o, l, t, e) : e.selection && (r = r.addSelection(e.startState.selection, o, l, t.newGroupDelay)), (n == "full" || n == "after") && (r = r.isolate()), r;
  },
  toJSON(r) {
    return { done: r.done.map((e) => e.toJSON()), undone: r.undone.map((e) => e.toJSON()) };
  },
  fromJSON(r) {
    return new ht(r.done.map(Ze.fromJSON), r.undone.map(Ze.fromJSON));
  }
});
function Ly(r = {}) {
  return [
    _d,
    Nd.of(r),
    C.domEventHandlers({
      beforeinput(e, t) {
        let i = e.inputType == "historyUndo" ? Ud : e.inputType == "historyRedo" ? Io : null;
        return i ? (e.preventDefault(), i(t)) : !1;
      }
    })
  ];
}
function os(r, e) {
  return function({ state: t, dispatch: i }) {
    if (!e && t.readOnly)
      return !1;
    let n = t.field(_d, !1);
    if (!n)
      return !1;
    let s = n.pop(r, t, e);
    return s ? (i(s), !0) : !1;
  };
}
const Ud = /* @__PURE__ */ os(0, !1), Io = /* @__PURE__ */ os(1, !1), Ny = /* @__PURE__ */ os(0, !0), _y = /* @__PURE__ */ os(1, !0);
class Ze {
  constructor(e, t, i, n, s) {
    this.changes = e, this.effects = t, this.mapped = i, this.startSelection = n, this.selectionsAfter = s;
  }
  setSelAfter(e) {
    return new Ze(this.changes, this.effects, this.mapped, this.startSelection, e);
  }
  toJSON() {
    var e, t, i;
    return {
      changes: (e = this.changes) === null || e === void 0 ? void 0 : e.toJSON(),
      mapped: (t = this.mapped) === null || t === void 0 ? void 0 : t.toJSON(),
      startSelection: (i = this.startSelection) === null || i === void 0 ? void 0 : i.toJSON(),
      selectionsAfter: this.selectionsAfter.map((n) => n.toJSON())
    };
  }
  static fromJSON(e) {
    return new Ze(e.changes && le.fromJSON(e.changes), [], e.mapped && ct.fromJSON(e.mapped), e.startSelection && y.fromJSON(e.startSelection), e.selectionsAfter.map(y.fromJSON));
  }
  // This does not check `addToHistory` and such, it assumes the
  // transaction needs to be converted to an item. Returns null when
  // there are no changes or effects in the transaction.
  static fromTransaction(e, t) {
    let i = Le;
    for (let n of e.startState.facet(zy)) {
      let s = n(e);
      s.length && (i = i.concat(s));
    }
    return !i.length && e.changes.empty ? null : new Ze(e.changes.invert(e.startState.doc), i, void 0, t || e.startState.selection, Le);
  }
  static selection(e) {
    return new Ze(void 0, Le, void 0, void 0, e);
  }
}
function In(r, e, t, i) {
  let n = e + 1 > t + 20 ? e - t - 1 : 0, s = r.slice(n, e);
  return s.push(i), s;
}
function Uy(r, e) {
  let t = [], i = !1;
  return r.iterChangedRanges((n, s) => t.push(n, s)), e.iterChangedRanges((n, s, o, l) => {
    for (let a = 0; a < t.length; ) {
      let h = t[a++], c = t[a++];
      l >= h && o <= c && (i = !0);
    }
  }), i;
}
function Iy(r, e) {
  return r.ranges.length == e.ranges.length && r.ranges.filter((t, i) => t.empty != e.ranges[i].empty).length === 0;
}
function Id(r, e) {
  return r.length ? e.length ? r.concat(e) : r : e;
}
const Le = [], jy = 200;
function jd(r, e) {
  if (r.length) {
    let t = r[r.length - 1], i = t.selectionsAfter.slice(Math.max(0, t.selectionsAfter.length - jy));
    return i.length && i[i.length - 1].eq(e) ? r : (i.push(e), In(r, r.length - 1, 1e9, t.setSelAfter(i)));
  } else
    return [Ze.selection([e])];
}
function Gy(r) {
  let e = r[r.length - 1], t = r.slice();
  return t[r.length - 1] = e.setSelAfter(e.selectionsAfter.slice(0, e.selectionsAfter.length - 1)), t;
}
function Ns(r, e) {
  if (!r.length)
    return r;
  let t = r.length, i = Le;
  for (; t; ) {
    let n = Fy(r[t - 1], e, i);
    if (n.changes && !n.changes.empty || n.effects.length) {
      let s = r.slice(0, t);
      return s[t - 1] = n, s;
    } else
      e = n.mapped, t--, i = n.selectionsAfter;
  }
  return i.length ? [Ze.selection(i)] : Le;
}
function Fy(r, e, t) {
  let i = Id(r.selectionsAfter.length ? r.selectionsAfter.map((l) => l.map(e)) : Le, t);
  if (!r.changes)
    return Ze.selection(i);
  let n = r.changes.map(e), s = e.mapDesc(r.changes, !0), o = r.mapped ? r.mapped.composeDesc(s) : s;
  return new Ze(n, M.mapEffects(r.effects, e), o, r.startSelection.map(s), i);
}
const Hy = /^(input\.type|delete)($|\.)/;
class ht {
  constructor(e, t, i = 0, n = void 0) {
    this.done = e, this.undone = t, this.prevTime = i, this.prevUserEvent = n;
  }
  isolate() {
    return this.prevTime ? new ht(this.done, this.undone) : this;
  }
  addChanges(e, t, i, n, s) {
    let o = this.done, l = o[o.length - 1];
    return l && l.changes && !l.changes.empty && e.changes && (!i || Hy.test(i)) && (!l.selectionsAfter.length && t - this.prevTime < n.newGroupDelay && n.joinToEvent(s, Uy(l.changes, e.changes)) || // For compose (but not compose.start) events, always join with previous event
    i == "input.type.compose") ? o = In(o, o.length - 1, n.minDepth, new Ze(e.changes.compose(l.changes), Id(e.effects, l.effects), l.mapped, l.startSelection, Le)) : o = In(o, o.length, n.minDepth, e), new ht(o, Le, t, i);
  }
  addSelection(e, t, i, n) {
    let s = this.done.length ? this.done[this.done.length - 1].selectionsAfter : Le;
    return s.length > 0 && t - this.prevTime < n && i == this.prevUserEvent && i && /^select($|\.)/.test(i) && Iy(s[s.length - 1], e) ? this : new ht(jd(this.done, e), this.undone, t, i);
  }
  addMapping(e) {
    return new ht(Ns(this.done, e), Ns(this.undone, e), this.prevTime, this.prevUserEvent);
  }
  pop(e, t, i) {
    let n = e == 0 ? this.done : this.undone;
    if (n.length == 0)
      return null;
    let s = n[n.length - 1], o = s.selectionsAfter[0] || t.selection;
    if (i && s.selectionsAfter.length)
      return t.update({
        selection: s.selectionsAfter[s.selectionsAfter.length - 1],
        annotations: Uo.of({ side: e, rest: Gy(n), selection: o }),
        userEvent: e == 0 ? "select.undo" : "select.redo",
        scrollIntoView: !0
      });
    if (s.changes) {
      let l = n.length == 1 ? Le : n.slice(0, n.length - 1);
      return s.mapped && (l = Ns(l, s.mapped)), t.update({
        changes: s.changes,
        selection: s.startSelection,
        effects: s.effects,
        annotations: Uo.of({ side: e, rest: l, selection: o }),
        filter: !1,
        userEvent: e == 0 ? "undo" : "redo",
        scrollIntoView: !0
      });
    } else
      return null;
  }
}
ht.empty = /* @__PURE__ */ new ht(Le, Le);
const Ky = [
  { key: "Mod-z", run: Ud, preventDefault: !0 },
  { key: "Mod-y", mac: "Mod-Shift-z", run: Io, preventDefault: !0 },
  { linux: "Ctrl-Shift-z", run: Io, preventDefault: !0 },
  { key: "Mod-u", run: Ny, preventDefault: !0 },
  { key: "Alt-u", mac: "Mod-Shift-u", run: _y, preventDefault: !0 }
];
function Ri(r, e) {
  return y.create(r.ranges.map(e), r.mainIndex);
}
function dt(r, e) {
  return r.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function Je({ state: r, dispatch: e }, t) {
  let i = Ri(r.selection, t);
  return i.eq(r.selection, !0) ? !1 : (e(dt(r, i)), !0);
}
function ls(r, e) {
  return y.cursor(e ? r.to : r.from);
}
function Gd(r, e) {
  return Je(r, (t) => t.empty ? r.moveByChar(t, e) : ls(t, e));
}
function Se(r) {
  return r.textDirectionAt(r.state.selection.main.head) == J.LTR;
}
const Fd = (r) => Gd(r, !Se(r)), Hd = (r) => Gd(r, Se(r));
function Kd(r, e) {
  return Je(r, (t) => t.empty ? r.moveByGroup(t, e) : ls(t, e));
}
const Jy = (r) => Kd(r, !Se(r)), ex = (r) => Kd(r, Se(r));
function tx(r, e, t) {
  if (e.type.prop(t))
    return !0;
  let i = e.to - e.from;
  return i && (i > 2 || /[^\s,.;:]/.test(r.sliceDoc(e.from, e.to))) || e.firstChild;
}
function as(r, e, t) {
  let i = H(r).resolveInner(e.head), n = t ? X.closedBy : X.openedBy;
  for (let a = e.head; ; ) {
    let h = t ? i.childAfter(a) : i.childBefore(a);
    if (!h)
      break;
    tx(r, h, n) ? i = h : a = t ? h.to : h.from;
  }
  let s = i.type.prop(n), o, l;
  return s && (o = t ? at(r, i.from, 1) : at(r, i.to, -1)) && o.matched ? l = t ? o.end.to : o.end.from : l = t ? i.to : i.from, y.cursor(l, t ? -1 : 1);
}
const ix = (r) => Je(r, (e) => as(r.state, e, !Se(r))), rx = (r) => Je(r, (e) => as(r.state, e, Se(r)));
function Jd(r, e) {
  return Je(r, (t) => {
    if (!t.empty)
      return ls(t, e);
    let i = r.moveVertically(t, e);
    return i.head != t.head ? i : r.moveToLineBoundary(t, e);
  });
}
const eO = (r) => Jd(r, !1), tO = (r) => Jd(r, !0);
function iO(r) {
  let e = r.scrollDOM.clientHeight < r.scrollDOM.scrollHeight - 2, t = 0, i = 0, n;
  if (e) {
    for (let s of r.state.facet(C.scrollMargins)) {
      let o = s(r);
      o != null && o.top && (t = Math.max(o == null ? void 0 : o.top, t)), o != null && o.bottom && (i = Math.max(o == null ? void 0 : o.bottom, i));
    }
    n = r.scrollDOM.clientHeight - t - i;
  } else
    n = (r.dom.ownerDocument.defaultView || window).innerHeight;
  return {
    marginTop: t,
    marginBottom: i,
    selfScroll: e,
    height: Math.max(r.defaultLineHeight, n - 5)
  };
}
function rO(r, e) {
  let t = iO(r), { state: i } = r, n = Ri(i.selection, (o) => o.empty ? r.moveVertically(o, e, t.height) : ls(o, e));
  if (n.eq(i.selection))
    return !1;
  let s;
  if (t.selfScroll) {
    let o = r.coordsAtPos(i.selection.main.head), l = r.scrollDOM.getBoundingClientRect(), a = l.top + t.marginTop, h = l.bottom - t.marginBottom;
    o && o.top > a && o.bottom < h && (s = C.scrollIntoView(n.main.head, { y: "start", yMargin: o.top - a }));
  }
  return r.dispatch(dt(i, n), { effects: s }), !0;
}
const uc = (r) => rO(r, !1), jo = (r) => rO(r, !0);
function qt(r, e, t) {
  let i = r.lineBlockAt(e.head), n = r.moveToLineBoundary(e, t);
  if (n.head == e.head && n.head != (t ? i.to : i.from) && (n = r.moveToLineBoundary(e, t, !1)), !t && n.head == i.from && i.length) {
    let s = /^\s*/.exec(r.state.sliceDoc(i.from, Math.min(i.from + 100, i.to)))[0].length;
    s && e.head != i.from + s && (n = y.cursor(i.from + s));
  }
  return n;
}
const nx = (r) => Je(r, (e) => qt(r, e, !0)), sx = (r) => Je(r, (e) => qt(r, e, !1)), ox = (r) => Je(r, (e) => qt(r, e, !Se(r))), lx = (r) => Je(r, (e) => qt(r, e, Se(r))), ax = (r) => Je(r, (e) => y.cursor(r.lineBlockAt(e.head).from, 1)), hx = (r) => Je(r, (e) => y.cursor(r.lineBlockAt(e.head).to, -1));
function cx(r, e, t) {
  let i = !1, n = Ri(r.selection, (s) => {
    let o = at(r, s.head, -1) || at(r, s.head, 1) || s.head > 0 && at(r, s.head - 1, 1) || s.head < r.doc.length && at(r, s.head + 1, -1);
    if (!o || !o.end)
      return s;
    i = !0;
    let l = o.start.from == s.head ? o.end.to : o.end.from;
    return y.cursor(l);
  });
  return i ? (e(dt(r, n)), !0) : !1;
}
const fx = ({ state: r, dispatch: e }) => cx(r, e);
function Ie(r, e) {
  let t = Ri(r.state.selection, (i) => {
    let n = e(i);
    return y.range(i.anchor, n.head, n.goalColumn, n.bidiLevel || void 0);
  });
  return t.eq(r.state.selection) ? !1 : (r.dispatch(dt(r.state, t)), !0);
}
function nO(r, e) {
  return Ie(r, (t) => r.moveByChar(t, e));
}
const sO = (r) => nO(r, !Se(r)), oO = (r) => nO(r, Se(r));
function lO(r, e) {
  return Ie(r, (t) => r.moveByGroup(t, e));
}
const ux = (r) => lO(r, !Se(r)), dx = (r) => lO(r, Se(r)), Ox = (r) => Ie(r, (e) => as(r.state, e, !Se(r))), px = (r) => Ie(r, (e) => as(r.state, e, Se(r)));
function aO(r, e) {
  return Ie(r, (t) => r.moveVertically(t, e));
}
const hO = (r) => aO(r, !1), cO = (r) => aO(r, !0);
function fO(r, e) {
  return Ie(r, (t) => r.moveVertically(t, e, iO(r).height));
}
const dc = (r) => fO(r, !1), Oc = (r) => fO(r, !0), mx = (r) => Ie(r, (e) => qt(r, e, !0)), gx = (r) => Ie(r, (e) => qt(r, e, !1)), bx = (r) => Ie(r, (e) => qt(r, e, !Se(r))), Sx = (r) => Ie(r, (e) => qt(r, e, Se(r))), yx = (r) => Ie(r, (e) => y.cursor(r.lineBlockAt(e.head).from)), xx = (r) => Ie(r, (e) => y.cursor(r.lineBlockAt(e.head).to)), pc = ({ state: r, dispatch: e }) => (e(dt(r, { anchor: 0 })), !0), mc = ({ state: r, dispatch: e }) => (e(dt(r, { anchor: r.doc.length })), !0), gc = ({ state: r, dispatch: e }) => (e(dt(r, { anchor: r.selection.main.anchor, head: 0 })), !0), bc = ({ state: r, dispatch: e }) => (e(dt(r, { anchor: r.selection.main.anchor, head: r.doc.length })), !0), kx = ({ state: r, dispatch: e }) => (e(r.update({ selection: { anchor: 0, head: r.doc.length }, userEvent: "select" })), !0), Qx = ({ state: r, dispatch: e }) => {
  let t = hs(r).map(({ from: i, to: n }) => y.range(i, Math.min(n + 1, r.doc.length)));
  return e(r.update({ selection: y.create(t), userEvent: "select" })), !0;
}, wx = ({ state: r, dispatch: e }) => {
  let t = Ri(r.selection, (i) => {
    var n;
    let s = H(r).resolveStack(i.from, 1);
    for (let o = s; o; o = o.next) {
      let { node: l } = o;
      if ((l.from < i.from && l.to >= i.to || l.to > i.to && l.from <= i.from) && (!((n = l.parent) === null || n === void 0) && n.parent))
        return y.range(l.to, l.from);
    }
    return i;
  });
  return e(dt(r, t)), !0;
}, Px = ({ state: r, dispatch: e }) => {
  let t = r.selection, i = null;
  return t.ranges.length > 1 ? i = y.create([t.main]) : t.main.empty || (i = y.create([y.cursor(t.main.head)])), i ? (e(dt(r, i)), !0) : !1;
};
function Wr(r, e) {
  if (r.state.readOnly)
    return !1;
  let t = "delete.selection", { state: i } = r, n = i.changeByRange((s) => {
    let { from: o, to: l } = s;
    if (o == l) {
      let a = e(s);
      a < o ? (t = "delete.backward", a = ln(r, a, !1)) : a > o && (t = "delete.forward", a = ln(r, a, !0)), o = Math.min(o, a), l = Math.max(l, a);
    } else
      o = ln(r, o, !1), l = ln(r, l, !0);
    return o == l ? { range: s } : { changes: { from: o, to: l }, range: y.cursor(o, o < s.head ? -1 : 1) };
  });
  return n.changes.empty ? !1 : (r.dispatch(i.update(n, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? C.announce.of(i.phrase("Selection deleted")) : void 0
  })), !0);
}
function ln(r, e, t) {
  if (r instanceof C)
    for (let i of r.state.facet(C.atomicRanges).map((n) => n(r)))
      i.between(e, e, (n, s) => {
        n < e && s > e && (e = t ? s : n);
      });
  return e;
}
const uO = (r, e, t) => Wr(r, (i) => {
  let n = i.from, { state: s } = r, o = s.doc.lineAt(n), l, a;
  if (t && !e && n > o.from && n < o.from + 200 && !/[^ \t]/.test(l = o.text.slice(0, n - o.from))) {
    if (l[l.length - 1] == "	")
      return n - 1;
    let h = Ge(l, s.tabSize), c = h % Vn(s) || Vn(s);
    for (let f = 0; f < c && l[l.length - 1 - f] == " "; f++)
      n--;
    a = n;
  } else
    a = pe(o.text, n - o.from, e, e) + o.from, a == n && o.number != (e ? s.doc.lines : 1) ? a += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(o.text.slice(a - o.from, n - o.from)) && (a = pe(o.text, a - o.from, !1, !1) + o.from);
  return a;
}), Go = (r) => uO(r, !1, !0), dO = (r) => uO(r, !0, !1), OO = (r, e) => Wr(r, (t) => {
  let i = t.head, { state: n } = r, s = n.doc.lineAt(i), o = n.charCategorizer(i);
  for (let l = null; ; ) {
    if (i == (e ? s.to : s.from)) {
      i == t.head && s.number != (e ? n.doc.lines : 1) && (i += e ? 1 : -1);
      break;
    }
    let a = pe(s.text, i - s.from, e) + s.from, h = s.text.slice(Math.min(i, a) - s.from, Math.max(i, a) - s.from), c = o(h);
    if (l != null && c != l)
      break;
    (h != " " || i != t.head) && (l = c), i = a;
  }
  return i;
}), pO = (r) => OO(r, !1), $x = (r) => OO(r, !0), vx = (r) => Wr(r, (e) => {
  let t = r.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(r.state.doc.length, e.head + 1);
}), Cx = (r) => Wr(r, (e) => {
  let t = r.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), Zx = (r) => Wr(r, (e) => {
  let t = r.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(r.state.doc.length, e.head + 1);
}), Tx = ({ state: r, dispatch: e }) => {
  if (r.readOnly)
    return !1;
  let t = r.changeByRange((i) => ({
    changes: { from: i.from, to: i.to, insert: L.of(["", ""]) },
    range: y.cursor(i.from)
  }));
  return e(r.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, Ax = ({ state: r, dispatch: e }) => {
  if (r.readOnly)
    return !1;
  let t = r.changeByRange((i) => {
    if (!i.empty || i.from == 0 || i.from == r.doc.length)
      return { range: i };
    let n = i.from, s = r.doc.lineAt(n), o = n == s.from ? n - 1 : pe(s.text, n - s.from, !1) + s.from, l = n == s.to ? n + 1 : pe(s.text, n - s.from, !0) + s.from;
    return {
      changes: { from: o, to: l, insert: r.doc.slice(n, l).append(r.doc.slice(o, n)) },
      range: y.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(r.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function hs(r) {
  let e = [], t = -1;
  for (let i of r.selection.ranges) {
    let n = r.doc.lineAt(i.from), s = r.doc.lineAt(i.to);
    if (!i.empty && i.to == s.from && (s = r.doc.lineAt(i.to - 1)), t >= n.number) {
      let o = e[e.length - 1];
      o.to = s.to, o.ranges.push(i);
    } else
      e.push({ from: n.from, to: s.to, ranges: [i] });
    t = s.number + 1;
  }
  return e;
}
function mO(r, e, t) {
  if (r.readOnly)
    return !1;
  let i = [], n = [];
  for (let s of hs(r)) {
    if (t ? s.to == r.doc.length : s.from == 0)
      continue;
    let o = r.doc.lineAt(t ? s.to + 1 : s.from - 1), l = o.length + 1;
    if (t) {
      i.push({ from: s.to, to: o.to }, { from: s.from, insert: o.text + r.lineBreak });
      for (let a of s.ranges)
        n.push(y.range(Math.min(r.doc.length, a.anchor + l), Math.min(r.doc.length, a.head + l)));
    } else {
      i.push({ from: o.from, to: s.from }, { from: s.to, insert: r.lineBreak + o.text });
      for (let a of s.ranges)
        n.push(y.range(a.anchor - l, a.head - l));
    }
  }
  return i.length ? (e(r.update({
    changes: i,
    scrollIntoView: !0,
    selection: y.create(n, r.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const Rx = ({ state: r, dispatch: e }) => mO(r, e, !1), Xx = ({ state: r, dispatch: e }) => mO(r, e, !0);
function gO(r, e, t) {
  if (r.readOnly)
    return !1;
  let i = [];
  for (let n of hs(r))
    t ? i.push({ from: n.from, insert: r.doc.slice(n.from, n.to) + r.lineBreak }) : i.push({ from: n.to, insert: r.lineBreak + r.doc.slice(n.from, n.to) });
  return e(r.update({ changes: i, scrollIntoView: !0, userEvent: "input.copyline" })), !0;
}
const Mx = ({ state: r, dispatch: e }) => gO(r, e, !1), Ex = ({ state: r, dispatch: e }) => gO(r, e, !0), Wx = (r) => {
  if (r.state.readOnly)
    return !1;
  let { state: e } = r, t = e.changes(hs(e).map(({ from: n, to: s }) => (n > 0 ? n-- : s < e.doc.length && s++, { from: n, to: s }))), i = Ri(e.selection, (n) => {
    let s;
    if (r.lineWrapping) {
      let o = r.lineBlockAt(n.head), l = r.coordsAtPos(n.head, n.assoc || 1);
      l && (s = o.bottom + r.documentTop - l.bottom + r.defaultLineHeight / 2);
    }
    return r.moveVertically(n, !0, s);
  }).map(t);
  return r.dispatch({ changes: t, selection: i, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function Yx(r, e) {
  if (/\(\)|\[\]|\{\}/.test(r.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = H(r).resolveInner(e), i = t.childBefore(e), n = t.childAfter(e), s;
  return i && n && i.to <= e && n.from >= e && (s = i.type.prop(X.closedBy)) && s.indexOf(n.name) > -1 && r.doc.lineAt(i.to).from == r.doc.lineAt(n.from).from && !/\S/.test(r.sliceDoc(i.to, n.from)) ? { from: i.to, to: n.from } : null;
}
const Dx = /* @__PURE__ */ bO(!1), qx = /* @__PURE__ */ bO(!0);
function bO(r) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let i = e.changeByRange((n) => {
      let { from: s, to: o } = n, l = e.doc.lineAt(s), a = !r && s == o && Yx(e, s);
      r && (s = o = (o <= l.to ? l : e.doc.lineAt(o)).to);
      let h = new is(e, { simulateBreak: s, simulateDoubleBreak: !!a }), c = xl(h, s);
      for (c == null && (c = Ge(/^\s*/.exec(e.doc.lineAt(s).text)[0], e.tabSize)); o < l.to && /\s/.test(l.text[o - l.from]); )
        o++;
      a ? { from: s, to: o } = a : s > l.from && s < l.from + 100 && !/\S/.test(l.text.slice(0, s)) && (s = l.from);
      let f = ["", mr(e, c)];
      return a && f.push(mr(e, h.lineIndent(l.from, -1))), {
        changes: { from: s, to: o, insert: L.of(f) },
        range: y.cursor(s + 1 + f[1].length)
      };
    });
    return t(e.update(i, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function Vl(r, e) {
  let t = -1;
  return r.changeByRange((i) => {
    let n = [];
    for (let o = i.from; o <= i.to; ) {
      let l = r.doc.lineAt(o);
      l.number > t && (i.empty || i.to > l.from) && (e(l, n, i), t = l.number), o = l.to + 1;
    }
    let s = r.changes(n);
    return {
      changes: n,
      range: y.range(s.mapPos(i.anchor, 1), s.mapPos(i.head, 1))
    };
  });
}
const Vx = ({ state: r, dispatch: e }) => {
  if (r.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), i = new is(r, { overrideIndentation: (s) => {
    let o = t[s];
    return o ?? -1;
  } }), n = Vl(r, (s, o, l) => {
    let a = xl(i, s.from);
    if (a == null)
      return;
    /\S/.test(s.text) || (a = 0);
    let h = /^\s*/.exec(s.text)[0], c = mr(r, a);
    (h != c || l.from < s.from + h.length) && (t[s.from] = a, o.push({ from: s.from, to: s.from + h.length, insert: c }));
  });
  return n.changes.empty || e(r.update(n, { userEvent: "indent" })), !0;
}, Bx = ({ state: r, dispatch: e }) => r.readOnly ? !1 : (e(r.update(Vl(r, (t, i) => {
  i.push({ from: t.from, insert: r.facet(Rr) });
}), { userEvent: "input.indent" })), !0), zx = ({ state: r, dispatch: e }) => r.readOnly ? !1 : (e(r.update(Vl(r, (t, i) => {
  let n = /^\s*/.exec(t.text)[0];
  if (!n)
    return;
  let s = Ge(n, r.tabSize), o = 0, l = mr(r, Math.max(0, s - Vn(r)));
  for (; o < n.length && o < l.length && n.charCodeAt(o) == l.charCodeAt(o); )
    o++;
  i.push({ from: t.from + o, to: t.from + n.length, insert: l.slice(o) });
}), { userEvent: "delete.dedent" })), !0), Lx = (r) => (r.setTabFocusMode(), !0), Nx = [
  { key: "Ctrl-b", run: Fd, shift: sO, preventDefault: !0 },
  { key: "Ctrl-f", run: Hd, shift: oO },
  { key: "Ctrl-p", run: eO, shift: hO },
  { key: "Ctrl-n", run: tO, shift: cO },
  { key: "Ctrl-a", run: ax, shift: yx },
  { key: "Ctrl-e", run: hx, shift: xx },
  { key: "Ctrl-d", run: dO },
  { key: "Ctrl-h", run: Go },
  { key: "Ctrl-k", run: vx },
  { key: "Ctrl-Alt-h", run: pO },
  { key: "Ctrl-o", run: Tx },
  { key: "Ctrl-t", run: Ax },
  { key: "Ctrl-v", run: jo }
], _x = /* @__PURE__ */ [
  { key: "ArrowLeft", run: Fd, shift: sO, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: Jy, shift: ux, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: ox, shift: bx, preventDefault: !0 },
  { key: "ArrowRight", run: Hd, shift: oO, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: ex, shift: dx, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: lx, shift: Sx, preventDefault: !0 },
  { key: "ArrowUp", run: eO, shift: hO, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: pc, shift: gc },
  { mac: "Ctrl-ArrowUp", run: uc, shift: dc },
  { key: "ArrowDown", run: tO, shift: cO, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: mc, shift: bc },
  { mac: "Ctrl-ArrowDown", run: jo, shift: Oc },
  { key: "PageUp", run: uc, shift: dc },
  { key: "PageDown", run: jo, shift: Oc },
  { key: "Home", run: sx, shift: gx, preventDefault: !0 },
  { key: "Mod-Home", run: pc, shift: gc },
  { key: "End", run: nx, shift: mx, preventDefault: !0 },
  { key: "Mod-End", run: mc, shift: bc },
  { key: "Enter", run: Dx },
  { key: "Mod-a", run: kx },
  { key: "Backspace", run: Go, shift: Go },
  { key: "Delete", run: dO },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: pO },
  { key: "Mod-Delete", mac: "Alt-Delete", run: $x },
  { mac: "Mod-Backspace", run: Cx },
  { mac: "Mod-Delete", run: Zx }
].concat(/* @__PURE__ */ Nx.map((r) => ({ mac: r.key, run: r.run, shift: r.shift }))), Ux = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: ix, shift: Ox },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: rx, shift: px },
  { key: "Alt-ArrowUp", run: Rx },
  { key: "Shift-Alt-ArrowUp", run: Mx },
  { key: "Alt-ArrowDown", run: Xx },
  { key: "Shift-Alt-ArrowDown", run: Ex },
  { key: "Escape", run: Px },
  { key: "Mod-Enter", run: qx },
  { key: "Alt-l", mac: "Ctrl-l", run: Qx },
  { key: "Mod-i", run: wx, preventDefault: !0 },
  { key: "Mod-[", run: zx },
  { key: "Mod-]", run: Bx },
  { key: "Mod-Alt-\\", run: Vx },
  { key: "Shift-Mod-k", run: Wx },
  { key: "Shift-Mod-\\", run: fx },
  { key: "Mod-/", run: My },
  { key: "Alt-A", run: Wy },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: Lx }
].concat(_x);
function G() {
  var r = arguments[0];
  typeof r == "string" && (r = document.createElement(r));
  var e = 1, t = arguments[1];
  if (t && typeof t == "object" && t.nodeType == null && !Array.isArray(t)) {
    for (var i in t) if (Object.prototype.hasOwnProperty.call(t, i)) {
      var n = t[i];
      typeof n == "string" ? r.setAttribute(i, n) : n != null && (r[i] = n);
    }
    e++;
  }
  for (; e < arguments.length; e++) SO(r, arguments[e]);
  return r;
}
function SO(r, e) {
  if (typeof e == "string")
    r.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    r.appendChild(e);
  else if (Array.isArray(e))
    for (var t = 0; t < e.length; t++) SO(r, e[t]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
const Sc = typeof String.prototype.normalize == "function" ? (r) => r.normalize("NFKD") : (r) => r;
class Ci {
  /**
  Create a text cursor. The query is the search string, `from` to
  `to` provides the region to search.
  
  When `normalize` is given, it will be called, on both the query
  string and the content it is matched against, before comparing.
  You can, for example, create a case-insensitive search by
  passing `s => s.toLowerCase()`.
  
  Text is always normalized with
  [`.normalize("NFKD")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)
  (when supported).
  */
  constructor(e, t, i = 0, n = e.length, s, o) {
    this.test = o, this.value = { from: 0, to: 0 }, this.done = !1, this.matches = [], this.buffer = "", this.bufferPos = 0, this.iter = e.iterRange(i, n), this.bufferStart = i, this.normalize = s ? (l) => s(Sc(l)) : Sc, this.query = this.normalize(t);
  }
  peek() {
    if (this.bufferPos == this.buffer.length) {
      if (this.bufferStart += this.buffer.length, this.iter.next(), this.iter.done)
        return -1;
      this.bufferPos = 0, this.buffer = this.iter.value;
    }
    return fe(this.buffer, this.bufferPos);
  }
  /**
  Look for the next match. Updates the iterator's
  [`value`](https://codemirror.net/6/docs/ref/#search.SearchCursor.value) and
  [`done`](https://codemirror.net/6/docs/ref/#search.SearchCursor.done) properties. Should be called
  at least once before using the cursor.
  */
  next() {
    for (; this.matches.length; )
      this.matches.pop();
    return this.nextOverlapping();
  }
  /**
  The `next` method will ignore matches that partially overlap a
  previous match. This method behaves like `next`, but includes
  such matches.
  */
  nextOverlapping() {
    for (; ; ) {
      let e = this.peek();
      if (e < 0)
        return this.done = !0, this;
      let t = sl(e), i = this.bufferStart + this.bufferPos;
      this.bufferPos += Ve(e);
      let n = this.normalize(t);
      for (let s = 0, o = i; ; s++) {
        let l = n.charCodeAt(s), a = this.match(l, o, this.bufferPos + this.bufferStart);
        if (s == n.length - 1) {
          if (a)
            return this.value = a, this;
          break;
        }
        o == i && s < t.length && t.charCodeAt(s) == l && o++;
      }
    }
  }
  match(e, t, i) {
    let n = null;
    for (let s = 0; s < this.matches.length; s += 2) {
      let o = this.matches[s], l = !1;
      this.query.charCodeAt(o) == e && (o == this.query.length - 1 ? n = { from: this.matches[s + 1], to: i } : (this.matches[s]++, l = !0)), l || (this.matches.splice(s, 2), s -= 2);
    }
    return this.query.charCodeAt(0) == e && (this.query.length == 1 ? n = { from: t, to: i } : this.matches.push(1, t)), n && this.test && !this.test(n.from, n.to, this.buffer, this.bufferStart) && (n = null), n;
  }
}
typeof Symbol < "u" && (Ci.prototype[Symbol.iterator] = function() {
  return this;
});
const yO = { from: -1, to: -1, match: /* @__PURE__ */ /.*/.exec("") }, Bl = "gm" + (/x/.unicode == null ? "" : "u");
class xO {
  /**
  Create a cursor that will search the given range in the given
  document. `query` should be the raw pattern (as you'd pass it to
  `new RegExp`).
  */
  constructor(e, t, i, n = 0, s = e.length) {
    if (this.text = e, this.to = s, this.curLine = "", this.done = !1, this.value = yO, /\\[sWDnr]|\n|\r|\[\^/.test(t))
      return new kO(e, t, i, n, s);
    this.re = new RegExp(t, Bl + (i != null && i.ignoreCase ? "i" : "")), this.test = i == null ? void 0 : i.test, this.iter = e.iter();
    let o = e.lineAt(n);
    this.curLineStart = o.from, this.matchPos = jn(e, n), this.getLine(this.curLineStart);
  }
  getLine(e) {
    this.iter.next(e), this.iter.lineBreak ? this.curLine = "" : (this.curLine = this.iter.value, this.curLineStart + this.curLine.length > this.to && (this.curLine = this.curLine.slice(0, this.to - this.curLineStart)), this.iter.next());
  }
  nextLine() {
    this.curLineStart = this.curLineStart + this.curLine.length + 1, this.curLineStart > this.to ? this.curLine = "" : this.getLine(0);
  }
  /**
  Move to the next match, if there is one.
  */
  next() {
    for (let e = this.matchPos - this.curLineStart; ; ) {
      this.re.lastIndex = e;
      let t = this.matchPos <= this.to && this.re.exec(this.curLine);
      if (t) {
        let i = this.curLineStart + t.index, n = i + t[0].length;
        if (this.matchPos = jn(this.text, n + (i == n ? 1 : 0)), i == this.curLineStart + this.curLine.length && this.nextLine(), (i < n || i > this.value.to) && (!this.test || this.test(i, n, t)))
          return this.value = { from: i, to: n, match: t }, this;
        e = this.matchPos - this.curLineStart;
      } else if (this.curLineStart + this.curLine.length < this.to)
        this.nextLine(), e = 0;
      else
        return this.done = !0, this;
    }
  }
}
const _s = /* @__PURE__ */ new WeakMap();
class bi {
  constructor(e, t) {
    this.from = e, this.text = t;
  }
  get to() {
    return this.from + this.text.length;
  }
  static get(e, t, i) {
    let n = _s.get(e);
    if (!n || n.from >= i || n.to <= t) {
      let l = new bi(t, e.sliceString(t, i));
      return _s.set(e, l), l;
    }
    if (n.from == t && n.to == i)
      return n;
    let { text: s, from: o } = n;
    return o > t && (s = e.sliceString(t, o) + s, o = t), n.to < i && (s += e.sliceString(n.to, i)), _s.set(e, new bi(o, s)), new bi(t, s.slice(t - o, i - o));
  }
}
class kO {
  constructor(e, t, i, n, s) {
    this.text = e, this.to = s, this.done = !1, this.value = yO, this.matchPos = jn(e, n), this.re = new RegExp(t, Bl + (i != null && i.ignoreCase ? "i" : "")), this.test = i == null ? void 0 : i.test, this.flat = bi.get(e, n, this.chunkEnd(
      n + 5e3
      /* Chunk.Base */
    ));
  }
  chunkEnd(e) {
    return e >= this.to ? this.to : this.text.lineAt(e).to;
  }
  next() {
    for (; ; ) {
      let e = this.re.lastIndex = this.matchPos - this.flat.from, t = this.re.exec(this.flat.text);
      if (t && !t[0] && t.index == e && (this.re.lastIndex = e + 1, t = this.re.exec(this.flat.text)), t) {
        let i = this.flat.from + t.index, n = i + t[0].length;
        if ((this.flat.to >= this.to || t.index + t[0].length <= this.flat.text.length - 10) && (!this.test || this.test(i, n, t)))
          return this.value = { from: i, to: n, match: t }, this.matchPos = jn(this.text, n + (i == n ? 1 : 0)), this;
      }
      if (this.flat.to == this.to)
        return this.done = !0, this;
      this.flat = bi.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
    }
  }
}
typeof Symbol < "u" && (xO.prototype[Symbol.iterator] = kO.prototype[Symbol.iterator] = function() {
  return this;
});
function Ix(r) {
  try {
    return new RegExp(r, Bl), !0;
  } catch {
    return !1;
  }
}
function jn(r, e) {
  if (e >= r.length)
    return e;
  let t = r.lineAt(e), i;
  for (; e < t.to && (i = t.text.charCodeAt(e - t.from)) >= 56320 && i < 57344; )
    e++;
  return e;
}
function Fo(r) {
  let e = String(r.state.doc.lineAt(r.state.selection.main.head).number), t = G("input", { class: "cm-textfield", name: "line", value: e }), i = G("form", {
    class: "cm-gotoLine",
    onkeydown: (s) => {
      s.keyCode == 27 ? (s.preventDefault(), r.dispatch({ effects: Gn.of(!1) }), r.focus()) : s.keyCode == 13 && (s.preventDefault(), n());
    },
    onsubmit: (s) => {
      s.preventDefault(), n();
    }
  }, G("label", r.state.phrase("Go to line"), ": ", t), " ", G("button", { class: "cm-button", type: "submit" }, r.state.phrase("go")));
  function n() {
    let s = /^([+-])?(\d+)?(:\d+)?(%)?$/.exec(t.value);
    if (!s)
      return;
    let { state: o } = r, l = o.doc.lineAt(o.selection.main.head), [, a, h, c, f] = s, d = c ? +c.slice(1) : 0, O = h ? +h : l.number;
    if (h && f) {
      let g = O / 100;
      a && (g = g * (a == "-" ? -1 : 1) + l.number / o.doc.lines), O = Math.round(o.doc.lines * g);
    } else h && a && (O = O * (a == "-" ? -1 : 1) + l.number);
    let p = o.doc.line(Math.max(1, Math.min(o.doc.lines, O))), m = y.cursor(p.from + Math.max(0, Math.min(d, p.length)));
    r.dispatch({
      effects: [Gn.of(!1), C.scrollIntoView(m.from, { y: "center" })],
      selection: m
    }), r.focus();
  }
  return { dom: i };
}
const Gn = /* @__PURE__ */ M.define(), yc = /* @__PURE__ */ he.define({
  create() {
    return !0;
  },
  update(r, e) {
    for (let t of e.effects)
      t.is(Gn) && (r = t.value);
    return r;
  },
  provide: (r) => Or.from(r, (e) => e ? Fo : null)
}), jx = (r) => {
  let e = dr(r, Fo);
  if (!e) {
    let t = [Gn.of(!0)];
    r.state.field(yc, !1) == null && t.push(M.appendConfig.of([yc, Gx])), r.dispatch({ effects: t }), e = dr(r, Fo);
  }
  return e && e.dom.querySelector("input").select(), !0;
}, Gx = /* @__PURE__ */ C.baseTheme({
  ".cm-panel.cm-gotoLine": {
    padding: "2px 6px 4px",
    "& label": { fontSize: "80%" }
  }
}), Fx = {
  highlightWordAroundCursor: !1,
  minSelectionLength: 1,
  maxMatches: 100,
  wholeWords: !1
}, Hx = /* @__PURE__ */ T.define({
  combine(r) {
    return ut(r, Fx, {
      highlightWordAroundCursor: (e, t) => e || t,
      minSelectionLength: Math.min,
      maxMatches: Math.min
    });
  }
});
function Kx(r) {
  return [rk, ik];
}
const Jx = /* @__PURE__ */ R.mark({ class: "cm-selectionMatch" }), ek = /* @__PURE__ */ R.mark({ class: "cm-selectionMatch cm-selectionMatch-main" });
function xc(r, e, t, i) {
  return (t == 0 || r(e.sliceDoc(t - 1, t)) != ee.Word) && (i == e.doc.length || r(e.sliceDoc(i, i + 1)) != ee.Word);
}
function tk(r, e, t, i) {
  return r(e.sliceDoc(t, t + 1)) == ee.Word && r(e.sliceDoc(i - 1, i)) == ee.Word;
}
const ik = /* @__PURE__ */ se.fromClass(class {
  constructor(r) {
    this.decorations = this.getDeco(r);
  }
  update(r) {
    (r.selectionSet || r.docChanged || r.viewportChanged) && (this.decorations = this.getDeco(r.view));
  }
  getDeco(r) {
    let e = r.state.facet(Hx), { state: t } = r, i = t.selection;
    if (i.ranges.length > 1)
      return R.none;
    let n = i.main, s, o = null;
    if (n.empty) {
      if (!e.highlightWordAroundCursor)
        return R.none;
      let a = t.wordAt(n.head);
      if (!a)
        return R.none;
      o = t.charCategorizer(n.head), s = t.sliceDoc(a.from, a.to);
    } else {
      let a = n.to - n.from;
      if (a < e.minSelectionLength || a > 200)
        return R.none;
      if (e.wholeWords) {
        if (s = t.sliceDoc(n.from, n.to), o = t.charCategorizer(n.head), !(xc(o, t, n.from, n.to) && tk(o, t, n.from, n.to)))
          return R.none;
      } else if (s = t.sliceDoc(n.from, n.to), !s)
        return R.none;
    }
    let l = [];
    for (let a of r.visibleRanges) {
      let h = new Ci(t.doc, s, a.from, a.to);
      for (; !h.next().done; ) {
        let { from: c, to: f } = h.value;
        if ((!o || xc(o, t, c, f)) && (n.empty && c <= n.from && f >= n.to ? l.push(ek.range(c, f)) : (c >= n.to || f <= n.from) && l.push(Jx.range(c, f)), l.length > e.maxMatches))
          return R.none;
      }
    }
    return R.set(l);
  }
}, {
  decorations: (r) => r.decorations
}), rk = /* @__PURE__ */ C.baseTheme({
  ".cm-selectionMatch": { backgroundColor: "#99ff7780" },
  ".cm-searchMatch .cm-selectionMatch": { backgroundColor: "transparent" }
}), nk = ({ state: r, dispatch: e }) => {
  let { selection: t } = r, i = y.create(t.ranges.map((n) => r.wordAt(n.head) || y.cursor(n.head)), t.mainIndex);
  return i.eq(t) ? !1 : (e(r.update({ selection: i })), !0);
};
function sk(r, e) {
  let { main: t, ranges: i } = r.selection, n = r.wordAt(t.head), s = n && n.from == t.from && n.to == t.to;
  for (let o = !1, l = new Ci(r.doc, e, i[i.length - 1].to); ; )
    if (l.next(), l.done) {
      if (o)
        return null;
      l = new Ci(r.doc, e, 0, Math.max(0, i[i.length - 1].from - 1)), o = !0;
    } else {
      if (o && i.some((a) => a.from == l.value.from))
        continue;
      if (s) {
        let a = r.wordAt(l.value.from);
        if (!a || a.from != l.value.from || a.to != l.value.to)
          continue;
      }
      return l.value;
    }
}
const ok = ({ state: r, dispatch: e }) => {
  let { ranges: t } = r.selection;
  if (t.some((s) => s.from === s.to))
    return nk({ state: r, dispatch: e });
  let i = r.sliceDoc(t[0].from, t[0].to);
  if (r.selection.ranges.some((s) => r.sliceDoc(s.from, s.to) != i))
    return !1;
  let n = sk(r, i);
  return n ? (e(r.update({
    selection: r.selection.addRange(y.range(n.from, n.to), !1),
    effects: C.scrollIntoView(n.to)
  })), !0) : !1;
}, Xi = /* @__PURE__ */ T.define({
  combine(r) {
    return ut(r, {
      top: !1,
      caseSensitive: !1,
      literal: !1,
      regexp: !1,
      wholeWord: !1,
      createPanel: (e) => new bk(e),
      scrollToMatch: (e) => C.scrollIntoView(e)
    });
  }
});
class QO {
  /**
  Create a query object.
  */
  constructor(e) {
    this.search = e.search, this.caseSensitive = !!e.caseSensitive, this.literal = !!e.literal, this.regexp = !!e.regexp, this.replace = e.replace || "", this.valid = !!this.search && (!this.regexp || Ix(this.search)), this.unquoted = this.unquote(this.search), this.wholeWord = !!e.wholeWord;
  }
  /**
  @internal
  */
  unquote(e) {
    return this.literal ? e : e.replace(/\\([nrt\\])/g, (t, i) => i == "n" ? `
` : i == "r" ? "\r" : i == "t" ? "	" : "\\");
  }
  /**
  Compare this query to another query.
  */
  eq(e) {
    return this.search == e.search && this.replace == e.replace && this.caseSensitive == e.caseSensitive && this.regexp == e.regexp && this.wholeWord == e.wholeWord;
  }
  /**
  @internal
  */
  create() {
    return this.regexp ? new ck(this) : new ak(this);
  }
  /**
  Get a search cursor for this query, searching through the given
  range in the given state.
  */
  getCursor(e, t = 0, i) {
    let n = e.doc ? e : B.create({ doc: e });
    return i == null && (i = n.doc.length), this.regexp ? ai(this, n, t, i) : li(this, n, t, i);
  }
}
class wO {
  constructor(e) {
    this.spec = e;
  }
}
function li(r, e, t, i) {
  return new Ci(e.doc, r.unquoted, t, i, r.caseSensitive ? void 0 : (n) => n.toLowerCase(), r.wholeWord ? lk(e.doc, e.charCategorizer(e.selection.main.head)) : void 0);
}
function lk(r, e) {
  return (t, i, n, s) => ((s > t || s + n.length < i) && (s = Math.max(0, t - 2), n = r.sliceString(s, Math.min(r.length, i + 2))), (e(Fn(n, t - s)) != ee.Word || e(Hn(n, t - s)) != ee.Word) && (e(Hn(n, i - s)) != ee.Word || e(Fn(n, i - s)) != ee.Word));
}
class ak extends wO {
  constructor(e) {
    super(e);
  }
  nextMatch(e, t, i) {
    let n = li(this.spec, e, i, e.doc.length).nextOverlapping();
    return n.done && (n = li(this.spec, e, 0, t).nextOverlapping()), n.done ? null : n.value;
  }
  // Searching in reverse is, rather than implementing an inverted search
  // cursor, done by scanning chunk after chunk forward.
  prevMatchInRange(e, t, i) {
    for (let n = i; ; ) {
      let s = Math.max(t, n - 1e4 - this.spec.unquoted.length), o = li(this.spec, e, s, n), l = null;
      for (; !o.nextOverlapping().done; )
        l = o.value;
      if (l)
        return l;
      if (s == t)
        return null;
      n -= 1e4;
    }
  }
  prevMatch(e, t, i) {
    return this.prevMatchInRange(e, 0, t) || this.prevMatchInRange(e, i, e.doc.length);
  }
  getReplacement(e) {
    return this.spec.unquote(this.spec.replace);
  }
  matchAll(e, t) {
    let i = li(this.spec, e, 0, e.doc.length), n = [];
    for (; !i.next().done; ) {
      if (n.length >= t)
        return null;
      n.push(i.value);
    }
    return n;
  }
  highlight(e, t, i, n) {
    let s = li(this.spec, e, Math.max(0, t - this.spec.unquoted.length), Math.min(i + this.spec.unquoted.length, e.doc.length));
    for (; !s.next().done; )
      n(s.value.from, s.value.to);
  }
}
function ai(r, e, t, i) {
  return new xO(e.doc, r.search, {
    ignoreCase: !r.caseSensitive,
    test: r.wholeWord ? hk(e.charCategorizer(e.selection.main.head)) : void 0
  }, t, i);
}
function Fn(r, e) {
  return r.slice(pe(r, e, !1), e);
}
function Hn(r, e) {
  return r.slice(e, pe(r, e));
}
function hk(r) {
  return (e, t, i) => !i[0].length || (r(Fn(i.input, i.index)) != ee.Word || r(Hn(i.input, i.index)) != ee.Word) && (r(Hn(i.input, i.index + i[0].length)) != ee.Word || r(Fn(i.input, i.index + i[0].length)) != ee.Word);
}
class ck extends wO {
  nextMatch(e, t, i) {
    let n = ai(this.spec, e, i, e.doc.length).next();
    return n.done && (n = ai(this.spec, e, 0, t).next()), n.done ? null : n.value;
  }
  prevMatchInRange(e, t, i) {
    for (let n = 1; ; n++) {
      let s = Math.max(
        t,
        i - n * 1e4
        /* FindPrev.ChunkSize */
      ), o = ai(this.spec, e, s, i), l = null;
      for (; !o.next().done; )
        l = o.value;
      if (l && (s == t || l.from > s + 10))
        return l;
      if (s == t)
        return null;
    }
  }
  prevMatch(e, t, i) {
    return this.prevMatchInRange(e, 0, t) || this.prevMatchInRange(e, i, e.doc.length);
  }
  getReplacement(e) {
    return this.spec.unquote(this.spec.replace).replace(/\$([$&\d+])/g, (t, i) => i == "$" ? "$" : i == "&" ? e.match[0] : i != "0" && +i < e.match.length ? e.match[i] : t);
  }
  matchAll(e, t) {
    let i = ai(this.spec, e, 0, e.doc.length), n = [];
    for (; !i.next().done; ) {
      if (n.length >= t)
        return null;
      n.push(i.value);
    }
    return n;
  }
  highlight(e, t, i, n) {
    let s = ai(this.spec, e, Math.max(
      0,
      t - 250
      /* RegExp.HighlightMargin */
    ), Math.min(i + 250, e.doc.length));
    for (; !s.next().done; )
      n(s.value.from, s.value.to);
  }
}
const Qr = /* @__PURE__ */ M.define(), zl = /* @__PURE__ */ M.define(), Xt = /* @__PURE__ */ he.define({
  create(r) {
    return new Us(Ho(r).create(), null);
  },
  update(r, e) {
    for (let t of e.effects)
      t.is(Qr) ? r = new Us(t.value.create(), r.panel) : t.is(zl) && (r = new Us(r.query, t.value ? Ll : null));
    return r;
  },
  provide: (r) => Or.from(r, (e) => e.panel)
});
class Us {
  constructor(e, t) {
    this.query = e, this.panel = t;
  }
}
const fk = /* @__PURE__ */ R.mark({ class: "cm-searchMatch" }), uk = /* @__PURE__ */ R.mark({ class: "cm-searchMatch cm-searchMatch-selected" }), dk = /* @__PURE__ */ se.fromClass(class {
  constructor(r) {
    this.view = r, this.decorations = this.highlight(r.state.field(Xt));
  }
  update(r) {
    let e = r.state.field(Xt);
    (e != r.startState.field(Xt) || r.docChanged || r.selectionSet || r.viewportChanged) && (this.decorations = this.highlight(e));
  }
  highlight({ query: r, panel: e }) {
    if (!e || !r.spec.valid)
      return R.none;
    let { view: t } = this, i = new Et();
    for (let n = 0, s = t.visibleRanges, o = s.length; n < o; n++) {
      let { from: l, to: a } = s[n];
      for (; n < o - 1 && a > s[n + 1].from - 2 * 250; )
        a = s[++n].to;
      r.highlight(t.state, l, a, (h, c) => {
        let f = t.state.selection.ranges.some((d) => d.from == h && d.to == c);
        i.add(h, c, f ? uk : fk);
      });
    }
    return i.finish();
  }
}, {
  decorations: (r) => r.decorations
});
function Yr(r) {
  return (e) => {
    let t = e.state.field(Xt, !1);
    return t && t.query.spec.valid ? r(e, t) : vO(e);
  };
}
const Kn = /* @__PURE__ */ Yr((r, { query: e }) => {
  let { to: t } = r.state.selection.main, i = e.nextMatch(r.state, t, t);
  if (!i)
    return !1;
  let n = y.single(i.from, i.to), s = r.state.facet(Xi);
  return r.dispatch({
    selection: n,
    effects: [Nl(r, i), s.scrollToMatch(n.main, r)],
    userEvent: "select.search"
  }), $O(r), !0;
}), Jn = /* @__PURE__ */ Yr((r, { query: e }) => {
  let { state: t } = r, { from: i } = t.selection.main, n = e.prevMatch(t, i, i);
  if (!n)
    return !1;
  let s = y.single(n.from, n.to), o = r.state.facet(Xi);
  return r.dispatch({
    selection: s,
    effects: [Nl(r, n), o.scrollToMatch(s.main, r)],
    userEvent: "select.search"
  }), $O(r), !0;
}), Ok = /* @__PURE__ */ Yr((r, { query: e }) => {
  let t = e.matchAll(r.state, 1e3);
  return !t || !t.length ? !1 : (r.dispatch({
    selection: y.create(t.map((i) => y.range(i.from, i.to))),
    userEvent: "select.search.matches"
  }), !0);
}), pk = ({ state: r, dispatch: e }) => {
  let t = r.selection;
  if (t.ranges.length > 1 || t.main.empty)
    return !1;
  let { from: i, to: n } = t.main, s = [], o = 0;
  for (let l = new Ci(r.doc, r.sliceDoc(i, n)); !l.next().done; ) {
    if (s.length > 1e3)
      return !1;
    l.value.from == i && (o = s.length), s.push(y.range(l.value.from, l.value.to));
  }
  return e(r.update({
    selection: y.create(s, o),
    userEvent: "select.search.matches"
  })), !0;
}, kc = /* @__PURE__ */ Yr((r, { query: e }) => {
  let { state: t } = r, { from: i, to: n } = t.selection.main;
  if (t.readOnly)
    return !1;
  let s = e.nextMatch(t, i, i);
  if (!s)
    return !1;
  let o = [], l, a, h = [];
  if (s.from == i && s.to == n && (a = t.toText(e.getReplacement(s)), o.push({ from: s.from, to: s.to, insert: a }), s = e.nextMatch(t, s.from, s.to), h.push(C.announce.of(t.phrase("replaced match on line $", t.doc.lineAt(i).number) + "."))), s) {
    let c = o.length == 0 || o[0].from >= s.to ? 0 : s.to - s.from - a.length;
    l = y.single(s.from - c, s.to - c), h.push(Nl(r, s)), h.push(t.facet(Xi).scrollToMatch(l.main, r));
  }
  return r.dispatch({
    changes: o,
    selection: l,
    effects: h,
    userEvent: "input.replace"
  }), !0;
}), mk = /* @__PURE__ */ Yr((r, { query: e }) => {
  if (r.state.readOnly)
    return !1;
  let t = e.matchAll(r.state, 1e9).map((n) => {
    let { from: s, to: o } = n;
    return { from: s, to: o, insert: e.getReplacement(n) };
  });
  if (!t.length)
    return !1;
  let i = r.state.phrase("replaced $ matches", t.length) + ".";
  return r.dispatch({
    changes: t,
    effects: C.announce.of(i),
    userEvent: "input.replace.all"
  }), !0;
});
function Ll(r) {
  return r.state.facet(Xi).createPanel(r);
}
function Ho(r, e) {
  var t, i, n, s, o;
  let l = r.selection.main, a = l.empty || l.to > l.from + 100 ? "" : r.sliceDoc(l.from, l.to);
  if (e && !a)
    return e;
  let h = r.facet(Xi);
  return new QO({
    search: ((t = e == null ? void 0 : e.literal) !== null && t !== void 0 ? t : h.literal) ? a : a.replace(/\n/g, "\\n"),
    caseSensitive: (i = e == null ? void 0 : e.caseSensitive) !== null && i !== void 0 ? i : h.caseSensitive,
    literal: (n = e == null ? void 0 : e.literal) !== null && n !== void 0 ? n : h.literal,
    regexp: (s = e == null ? void 0 : e.regexp) !== null && s !== void 0 ? s : h.regexp,
    wholeWord: (o = e == null ? void 0 : e.wholeWord) !== null && o !== void 0 ? o : h.wholeWord
  });
}
function PO(r) {
  let e = dr(r, Ll);
  return e && e.dom.querySelector("[main-field]");
}
function $O(r) {
  let e = PO(r);
  e && e == r.root.activeElement && e.select();
}
const vO = (r) => {
  let e = r.state.field(Xt, !1);
  if (e && e.panel) {
    let t = PO(r);
    if (t && t != r.root.activeElement) {
      let i = Ho(r.state, e.query.spec);
      i.valid && r.dispatch({ effects: Qr.of(i) }), t.focus(), t.select();
    }
  } else
    r.dispatch({ effects: [
      zl.of(!0),
      e ? Qr.of(Ho(r.state, e.query.spec)) : M.appendConfig.of(yk)
    ] });
  return !0;
}, CO = (r) => {
  let e = r.state.field(Xt, !1);
  if (!e || !e.panel)
    return !1;
  let t = dr(r, Ll);
  return t && t.dom.contains(r.root.activeElement) && r.focus(), r.dispatch({ effects: zl.of(!1) }), !0;
}, gk = [
  { key: "Mod-f", run: vO, scope: "editor search-panel" },
  { key: "F3", run: Kn, shift: Jn, scope: "editor search-panel", preventDefault: !0 },
  { key: "Mod-g", run: Kn, shift: Jn, scope: "editor search-panel", preventDefault: !0 },
  { key: "Escape", run: CO, scope: "editor search-panel" },
  { key: "Mod-Shift-l", run: pk },
  { key: "Mod-Alt-g", run: jx },
  { key: "Mod-d", run: ok, preventDefault: !0 }
];
class bk {
  constructor(e) {
    this.view = e;
    let t = this.query = e.state.field(Xt).query.spec;
    this.commit = this.commit.bind(this), this.searchField = G("input", {
      value: t.search,
      placeholder: Xe(e, "Find"),
      "aria-label": Xe(e, "Find"),
      class: "cm-textfield",
      name: "search",
      form: "",
      "main-field": "true",
      onchange: this.commit,
      onkeyup: this.commit
    }), this.replaceField = G("input", {
      value: t.replace,
      placeholder: Xe(e, "Replace"),
      "aria-label": Xe(e, "Replace"),
      class: "cm-textfield",
      name: "replace",
      form: "",
      onchange: this.commit,
      onkeyup: this.commit
    }), this.caseField = G("input", {
      type: "checkbox",
      name: "case",
      form: "",
      checked: t.caseSensitive,
      onchange: this.commit
    }), this.reField = G("input", {
      type: "checkbox",
      name: "re",
      form: "",
      checked: t.regexp,
      onchange: this.commit
    }), this.wordField = G("input", {
      type: "checkbox",
      name: "word",
      form: "",
      checked: t.wholeWord,
      onchange: this.commit
    });
    function i(n, s, o) {
      return G("button", { class: "cm-button", name: n, onclick: s, type: "button" }, o);
    }
    this.dom = G("div", { onkeydown: (n) => this.keydown(n), class: "cm-search" }, [
      this.searchField,
      i("next", () => Kn(e), [Xe(e, "next")]),
      i("prev", () => Jn(e), [Xe(e, "previous")]),
      i("select", () => Ok(e), [Xe(e, "all")]),
      G("label", null, [this.caseField, Xe(e, "match case")]),
      G("label", null, [this.reField, Xe(e, "regexp")]),
      G("label", null, [this.wordField, Xe(e, "by word")]),
      ...e.state.readOnly ? [] : [
        G("br"),
        this.replaceField,
        i("replace", () => kc(e), [Xe(e, "replace")]),
        i("replaceAll", () => mk(e), [Xe(e, "replace all")])
      ],
      G("button", {
        name: "close",
        onclick: () => CO(e),
        "aria-label": Xe(e, "close"),
        type: "button"
      }, ["×"])
    ]);
  }
  commit() {
    let e = new QO({
      search: this.searchField.value,
      caseSensitive: this.caseField.checked,
      regexp: this.reField.checked,
      wholeWord: this.wordField.checked,
      replace: this.replaceField.value
    });
    e.eq(this.query) || (this.query = e, this.view.dispatch({ effects: Qr.of(e) }));
  }
  keydown(e) {
    s0(this.view, e, "search-panel") ? e.preventDefault() : e.keyCode == 13 && e.target == this.searchField ? (e.preventDefault(), (e.shiftKey ? Jn : Kn)(this.view)) : e.keyCode == 13 && e.target == this.replaceField && (e.preventDefault(), kc(this.view));
  }
  update(e) {
    for (let t of e.transactions)
      for (let i of t.effects)
        i.is(Qr) && !i.value.eq(this.query) && this.setQuery(i.value);
  }
  setQuery(e) {
    this.query = e, this.searchField.value = e.search, this.replaceField.value = e.replace, this.caseField.checked = e.caseSensitive, this.reField.checked = e.regexp, this.wordField.checked = e.wholeWord;
  }
  mount() {
    this.searchField.select();
  }
  get pos() {
    return 80;
  }
  get top() {
    return this.view.state.facet(Xi).top;
  }
}
function Xe(r, e) {
  return r.state.phrase(e);
}
const an = 30, hn = /[\s\.,:;?!]/;
function Nl(r, { from: e, to: t }) {
  let i = r.state.doc.lineAt(e), n = r.state.doc.lineAt(t).to, s = Math.max(i.from, e - an), o = Math.min(n, t + an), l = r.state.sliceDoc(s, o);
  if (s != i.from) {
    for (let a = 0; a < an; a++)
      if (!hn.test(l[a + 1]) && hn.test(l[a])) {
        l = l.slice(a);
        break;
      }
  }
  if (o != n) {
    for (let a = l.length - 1; a > l.length - an; a--)
      if (!hn.test(l[a - 1]) && hn.test(l[a])) {
        l = l.slice(0, a);
        break;
      }
  }
  return C.announce.of(`${r.state.phrase("current match")}. ${l} ${r.state.phrase("on line")} ${i.number}.`);
}
const Sk = /* @__PURE__ */ C.baseTheme({
  ".cm-panel.cm-search": {
    padding: "2px 6px 4px",
    position: "relative",
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "4px",
      backgroundColor: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    },
    "& input, & button, & label": {
      margin: ".2em .6em .2em 0"
    },
    "& input[type=checkbox]": {
      marginRight: ".2em"
    },
    "& label": {
      fontSize: "80%",
      whiteSpace: "pre"
    }
  },
  "&light .cm-searchMatch": { backgroundColor: "#ffff0054" },
  "&dark .cm-searchMatch": { backgroundColor: "#00ffff8a" },
  "&light .cm-searchMatch-selected": { backgroundColor: "#ff6a0054" },
  "&dark .cm-searchMatch-selected": { backgroundColor: "#ff00ff8a" }
}), yk = [
  Xt,
  /* @__PURE__ */ xt.low(dk),
  Sk
];
class xk {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.diagnostic = i;
  }
}
class Nt {
  constructor(e, t, i) {
    this.diagnostics = e, this.panel = t, this.selected = i;
  }
  static init(e, t, i) {
    let n = e, s = i.facet(wr).markerFilter;
    s && (n = s(n, i));
    let o = R.set(n.map((l) => l.from == l.to || l.from == l.to - 1 && i.doc.lineAt(l.from).to == l.from ? R.widget({
      widget: new Tk(l),
      diagnostic: l
    }).range(l.from) : R.mark({
      attributes: { class: "cm-lintRange cm-lintRange-" + l.severity + (l.markClass ? " " + l.markClass : "") },
      diagnostic: l
    }).range(l.from, l.to)), !0);
    return new Nt(o, t, Zi(o));
  }
}
function Zi(r, e = null, t = 0) {
  let i = null;
  return r.between(t, 1e9, (n, s, { spec: o }) => {
    if (!(e && o.diagnostic != e))
      return i = new xk(n, s, o.diagnostic), !1;
  }), i;
}
function kk(r, e) {
  let t = e.pos, i = e.end || t, n = r.state.facet(wr).hideOn(r, t, i);
  if (n != null)
    return n;
  let s = r.startState.doc.lineAt(e.pos);
  return !!(r.effects.some((o) => o.is(ZO)) || r.changes.touchesRange(s.from, Math.max(s.to, i)));
}
function Qk(r, e) {
  return r.field(We, !1) ? e : e.concat(M.appendConfig.of(Xk));
}
const ZO = /* @__PURE__ */ M.define(), _l = /* @__PURE__ */ M.define(), TO = /* @__PURE__ */ M.define(), We = /* @__PURE__ */ he.define({
  create() {
    return new Nt(R.none, null, null);
  },
  update(r, e) {
    if (e.docChanged && r.diagnostics.size) {
      let t = r.diagnostics.map(e.changes), i = null, n = r.panel;
      if (r.selected) {
        let s = e.changes.mapPos(r.selected.from, 1);
        i = Zi(t, r.selected.diagnostic, s) || Zi(t, null, s);
      }
      !t.size && n && e.state.facet(wr).autoPanel && (n = null), r = new Nt(t, n, i);
    }
    for (let t of e.effects)
      if (t.is(ZO)) {
        let i = e.state.facet(wr).autoPanel ? t.value.length ? Pr.open : null : r.panel;
        r = Nt.init(t.value, i, e.state);
      } else t.is(_l) ? r = new Nt(r.diagnostics, t.value ? Pr.open : null, r.selected) : t.is(TO) && (r = new Nt(r.diagnostics, r.panel, t.value));
    return r;
  },
  provide: (r) => [
    Or.from(r, (e) => e.panel),
    C.decorations.from(r, (e) => e.diagnostics)
  ]
}), wk = /* @__PURE__ */ R.mark({ class: "cm-lintRange cm-lintRange-active" });
function Pk(r, e, t) {
  let { diagnostics: i } = r.state.field(We), n = [], s = 2e8, o = 0;
  i.between(e - (t < 0 ? 1 : 0), e + (t > 0 ? 1 : 0), (a, h, { spec: c }) => {
    e >= a && e <= h && (a == h || (e > a || t > 0) && (e < h || t < 0)) && (n.push(c.diagnostic), s = Math.min(a, s), o = Math.max(h, o));
  });
  let l = r.state.facet(wr).tooltipFilter;
  return l && (n = l(n, r.state)), n.length ? {
    pos: s,
    end: o,
    above: r.state.doc.lineAt(s).to < o,
    create() {
      return { dom: $k(r, n) };
    }
  } : null;
}
function $k(r, e) {
  return G("ul", { class: "cm-tooltip-lint" }, e.map((t) => RO(r, t, !1)));
}
const vk = (r) => {
  let e = r.state.field(We, !1);
  (!e || !e.panel) && r.dispatch({ effects: Qk(r.state, [_l.of(!0)]) });
  let t = dr(r, Pr.open);
  return t && t.dom.querySelector(".cm-panel-lint ul").focus(), !0;
}, Qc = (r) => {
  let e = r.state.field(We, !1);
  return !e || !e.panel ? !1 : (r.dispatch({ effects: _l.of(!1) }), !0);
}, Ck = (r) => {
  let e = r.state.field(We, !1);
  if (!e)
    return !1;
  let t = r.state.selection.main, i = e.diagnostics.iter(t.to + 1);
  return !i.value && (i = e.diagnostics.iter(0), !i.value || i.from == t.from && i.to == t.to) ? !1 : (r.dispatch({ selection: { anchor: i.from, head: i.to }, scrollIntoView: !0 }), !0);
}, Zk = [
  { key: "Mod-Shift-m", run: vk, preventDefault: !0 },
  { key: "F8", run: Ck }
], wr = /* @__PURE__ */ T.define({
  combine(r) {
    return Object.assign({ sources: r.map((e) => e.source).filter((e) => e != null) }, ut(r.map((e) => e.config), {
      delay: 750,
      markerFilter: null,
      tooltipFilter: null,
      needsRefresh: null,
      hideOn: () => null
    }, {
      needsRefresh: (e, t) => e ? t ? (i) => e(i) || t(i) : e : t
    }));
  }
});
function AO(r) {
  let e = [];
  if (r)
    e: for (let { name: t } of r) {
      for (let i = 0; i < t.length; i++) {
        let n = t[i];
        if (/[a-zA-Z]/.test(n) && !e.some((s) => s.toLowerCase() == n.toLowerCase())) {
          e.push(n);
          continue e;
        }
      }
      e.push("");
    }
  return e;
}
function RO(r, e, t) {
  var i;
  let n = t ? AO(e.actions) : [];
  return G("li", { class: "cm-diagnostic cm-diagnostic-" + e.severity }, G("span", { class: "cm-diagnosticText" }, e.renderMessage ? e.renderMessage(r) : e.message), (i = e.actions) === null || i === void 0 ? void 0 : i.map((s, o) => {
    let l = !1, a = (d) => {
      if (d.preventDefault(), l)
        return;
      l = !0;
      let O = Zi(r.state.field(We).diagnostics, e);
      O && s.apply(r, O.from, O.to);
    }, { name: h } = s, c = n[o] ? h.indexOf(n[o]) : -1, f = c < 0 ? h : [
      h.slice(0, c),
      G("u", h.slice(c, c + 1)),
      h.slice(c + 1)
    ];
    return G("button", {
      type: "button",
      class: "cm-diagnosticAction",
      onclick: a,
      onmousedown: a,
      "aria-label": ` Action: ${h}${c < 0 ? "" : ` (access key "${n[o]})"`}.`
    }, f);
  }), e.source && G("div", { class: "cm-diagnosticSource" }, e.source));
}
class Tk extends Qt {
  constructor(e) {
    super(), this.diagnostic = e;
  }
  eq(e) {
    return e.diagnostic == this.diagnostic;
  }
  toDOM() {
    return G("span", { class: "cm-lintPoint cm-lintPoint-" + this.diagnostic.severity });
  }
}
class wc {
  constructor(e, t) {
    this.diagnostic = t, this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16), this.dom = RO(e, t, !0), this.dom.id = this.id, this.dom.setAttribute("role", "option");
  }
}
class Pr {
  constructor(e) {
    this.view = e, this.items = [];
    let t = (n) => {
      if (n.keyCode == 27)
        Qc(this.view), this.view.focus();
      else if (n.keyCode == 38 || n.keyCode == 33)
        this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
      else if (n.keyCode == 40 || n.keyCode == 34)
        this.moveSelection((this.selectedIndex + 1) % this.items.length);
      else if (n.keyCode == 36)
        this.moveSelection(0);
      else if (n.keyCode == 35)
        this.moveSelection(this.items.length - 1);
      else if (n.keyCode == 13)
        this.view.focus();
      else if (n.keyCode >= 65 && n.keyCode <= 90 && this.selectedIndex >= 0) {
        let { diagnostic: s } = this.items[this.selectedIndex], o = AO(s.actions);
        for (let l = 0; l < o.length; l++)
          if (o[l].toUpperCase().charCodeAt(0) == n.keyCode) {
            let a = Zi(this.view.state.field(We).diagnostics, s);
            a && s.actions[l].apply(e, a.from, a.to);
          }
      } else
        return;
      n.preventDefault();
    }, i = (n) => {
      for (let s = 0; s < this.items.length; s++)
        this.items[s].dom.contains(n.target) && this.moveSelection(s);
    };
    this.list = G("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown: t,
      onclick: i
    }), this.dom = G("div", { class: "cm-panel-lint" }, this.list, G("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => Qc(this.view)
    }, "×")), this.update();
  }
  get selectedIndex() {
    let e = this.view.state.field(We).selected;
    if (!e)
      return -1;
    for (let t = 0; t < this.items.length; t++)
      if (this.items[t].diagnostic == e.diagnostic)
        return t;
    return -1;
  }
  update() {
    let { diagnostics: e, selected: t } = this.view.state.field(We), i = 0, n = !1, s = null;
    for (e.between(0, this.view.state.doc.length, (o, l, { spec: a }) => {
      let h = -1, c;
      for (let f = i; f < this.items.length; f++)
        if (this.items[f].diagnostic == a.diagnostic) {
          h = f;
          break;
        }
      h < 0 ? (c = new wc(this.view, a.diagnostic), this.items.splice(i, 0, c), n = !0) : (c = this.items[h], h > i && (this.items.splice(i, h - i), n = !0)), t && c.diagnostic == t.diagnostic ? c.dom.hasAttribute("aria-selected") || (c.dom.setAttribute("aria-selected", "true"), s = c) : c.dom.hasAttribute("aria-selected") && c.dom.removeAttribute("aria-selected"), i++;
    }); i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0); )
      n = !0, this.items.pop();
    this.items.length == 0 && (this.items.push(new wc(this.view, {
      from: -1,
      to: -1,
      severity: "info",
      message: this.view.state.phrase("No diagnostics")
    })), n = !0), s ? (this.list.setAttribute("aria-activedescendant", s.id), this.view.requestMeasure({
      key: this,
      read: () => ({ sel: s.dom.getBoundingClientRect(), panel: this.list.getBoundingClientRect() }),
      write: ({ sel: o, panel: l }) => {
        let a = l.height / this.list.offsetHeight;
        o.top < l.top ? this.list.scrollTop -= (l.top - o.top) / a : o.bottom > l.bottom && (this.list.scrollTop += (o.bottom - l.bottom) / a);
      }
    })) : this.selectedIndex < 0 && this.list.removeAttribute("aria-activedescendant"), n && this.sync();
  }
  sync() {
    let e = this.list.firstChild;
    function t() {
      let i = e;
      e = i.nextSibling, i.remove();
    }
    for (let i of this.items)
      if (i.dom.parentNode == this.list) {
        for (; e != i.dom; )
          t();
        e = i.dom.nextSibling;
      } else
        this.list.insertBefore(i.dom, e);
    for (; e; )
      t();
  }
  moveSelection(e) {
    if (this.selectedIndex < 0)
      return;
    let t = this.view.state.field(We), i = Zi(t.diagnostics, this.items[e].diagnostic);
    i && this.view.dispatch({
      selection: { anchor: i.from, head: i.to },
      scrollIntoView: !0,
      effects: TO.of(i)
    });
  }
  static open(e) {
    return new Pr(e);
  }
}
function Ak(r, e = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${e}>${encodeURIComponent(r)}</svg>')`;
}
function cn(r) {
  return Ak(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${r}" fill="none" stroke-width=".7"/>`, 'width="6" height="3"');
}
const Rk = /* @__PURE__ */ C.baseTheme({
  ".cm-diagnostic": {
    padding: "3px 6px 3px 8px",
    marginLeft: "-1px",
    display: "block",
    whiteSpace: "pre-wrap"
  },
  ".cm-diagnostic-error": { borderLeft: "5px solid #d11" },
  ".cm-diagnostic-warning": { borderLeft: "5px solid orange" },
  ".cm-diagnostic-info": { borderLeft: "5px solid #999" },
  ".cm-diagnostic-hint": { borderLeft: "5px solid #66d" },
  ".cm-diagnosticAction": {
    font: "inherit",
    border: "none",
    padding: "2px 4px",
    backgroundColor: "#444",
    color: "white",
    borderRadius: "3px",
    marginLeft: "8px",
    cursor: "pointer"
  },
  ".cm-diagnosticSource": {
    fontSize: "70%",
    opacity: 0.7
  },
  ".cm-lintRange": {
    backgroundPosition: "left bottom",
    backgroundRepeat: "repeat-x",
    paddingBottom: "0.7px"
  },
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ cn("#d11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ cn("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ cn("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ cn("#66d") },
  ".cm-lintRange-active": { backgroundColor: "#ffdd9980" },
  ".cm-tooltip-lint": {
    padding: 0,
    margin: 0
  },
  ".cm-lintPoint": {
    position: "relative",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "-2px",
      borderLeft: "3px solid transparent",
      borderRight: "3px solid transparent",
      borderBottom: "4px solid #d11"
    }
  },
  ".cm-lintPoint-warning": {
    "&:after": { borderBottomColor: "orange" }
  },
  ".cm-lintPoint-info": {
    "&:after": { borderBottomColor: "#999" }
  },
  ".cm-lintPoint-hint": {
    "&:after": { borderBottomColor: "#66d" }
  },
  ".cm-panel.cm-panel-lint": {
    position: "relative",
    "& ul": {
      maxHeight: "100px",
      overflowY: "auto",
      "& [aria-selected]": {
        backgroundColor: "#ddd",
        "& u": { textDecoration: "underline" }
      },
      "&:focus [aria-selected]": {
        background_fallback: "#bdf",
        backgroundColor: "Highlight",
        color_fallback: "white",
        color: "HighlightText"
      },
      "& u": { textDecoration: "none" },
      padding: 0,
      margin: 0
    },
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "2px",
      background: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    }
  }
}), Xk = [
  We,
  /* @__PURE__ */ C.decorations.compute([We], (r) => {
    let { selected: e, panel: t } = r.field(We);
    return !e || !t || e.from == e.to ? R.none : R.set([
      wk.range(e.from, e.to)
    ]);
  }),
  /* @__PURE__ */ _0(Pk, { hideOn: kk }),
  Rk
], Mk = [
  eb(),
  rb(),
  k0(),
  Ly(),
  Cb(),
  f0(),
  m0(),
  B.allowMultipleSelections.of(!0),
  mb(),
  Ru(Rb, { fallback: !0 }),
  qb(),
  fS(),
  kS(),
  M0(),
  Y0(),
  C0(),
  Kx(),
  Tr.of([
    ...pS,
    ...Ux,
    ...gk,
    ...Ky,
    ...wb,
    ...Fu,
    ...Zk
  ])
], ye = ({ variant: r, settings: e, styles: t }) => {
  const i = C.theme({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "&": {
      backgroundColor: e.background,
      color: e.foreground
    },
    ".cm-content": {
      caretColor: e.caret
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: e.caret
    },
    "&.cm-focused .cm-selectionBackgroundm .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: e.selection
    },
    ".cm-activeLine": {
      backgroundColor: e.lineHighlight
    },
    ".cm-gutters": {
      backgroundColor: e.gutterBackground,
      color: e.gutterForeground
    },
    ".cm-activeLineGutter": {
      backgroundColor: e.lineHighlight
    }
  }, {
    dark: r === "dark"
  }), n = Mr.define(t);
  return [i, Ru(n)];
};
ye({
  variant: "dark",
  settings: {
    background: "#200020",
    foreground: "#D0D0FF",
    caret: "#7070FF",
    selection: "#80000080",
    gutterBackground: "#200020",
    gutterForeground: "#C080C0",
    lineHighlight: "#80000040"
  },
  styles: [
    {
      tag: u.comment,
      color: "#404080"
    },
    {
      tag: [u.string, u.regexp],
      color: "#999999"
    },
    {
      tag: u.number,
      color: "#7090B0"
    },
    {
      tag: [u.bool, u.null],
      color: "#8080A0"
    },
    {
      tag: [u.punctuation, u.derefOperator],
      color: "#805080"
    },
    {
      tag: u.keyword,
      color: "#60B0FF"
    },
    {
      tag: u.definitionKeyword,
      color: "#B0FFF0"
    },
    {
      tag: u.moduleKeyword,
      color: "#60B0FF"
    },
    {
      tag: u.operator,
      color: "#A0A0FF"
    },
    {
      tag: [u.variableName, u.self],
      color: "#008080"
    },
    {
      tag: u.operatorKeyword,
      color: "#A0A0FF"
    },
    {
      tag: u.controlKeyword,
      color: "#80A0FF"
    },
    {
      tag: u.className,
      color: "#70E080"
    },
    {
      tag: [u.function(u.propertyName), u.propertyName],
      color: "#50A0A0"
    },
    {
      tag: u.tagName,
      color: "#009090"
    },
    {
      tag: u.modifier,
      color: "#B0FFF0"
    },
    {
      tag: [u.squareBracket, u.attributeName],
      color: "#D0D0FF"
    }
  ]
});
ye({
  variant: "light",
  settings: {
    background: "#fcfcfc",
    foreground: "#5c6166",
    caret: "#ffaa33",
    selection: "#036dd626",
    gutterBackground: "#fcfcfc",
    gutterForeground: "#8a919966",
    lineHighlight: "#8a91991a"
  },
  styles: [
    {
      tag: u.comment,
      color: "#787b8099"
    },
    {
      tag: u.string,
      color: "#86b300"
    },
    {
      tag: u.regexp,
      color: "#4cbf99"
    },
    {
      tag: [u.number, u.bool, u.null],
      color: "#ffaa33"
    },
    {
      tag: u.variableName,
      color: "#5c6166"
    },
    {
      tag: [u.definitionKeyword, u.modifier],
      color: "#fa8d3e"
    },
    {
      tag: [u.keyword, u.special(u.brace)],
      color: "#fa8d3e"
    },
    {
      tag: u.operator,
      color: "#ed9366"
    },
    {
      tag: u.separator,
      color: "#5c6166b3"
    },
    {
      tag: u.punctuation,
      color: "#5c6166"
    },
    {
      tag: [u.definition(u.propertyName), u.function(u.variableName)],
      color: "#f2ae49"
    },
    {
      tag: [u.className, u.definition(u.typeName)],
      color: "#22a4e6"
    },
    {
      tag: [u.tagName, u.typeName, u.self, u.labelName],
      color: "#55b4d4"
    },
    {
      tag: u.angleBracket,
      color: "#55b4d480"
    },
    {
      tag: u.attributeName,
      color: "#f2ae49"
    }
  ]
});
ye({
  variant: "dark",
  settings: {
    background: "#15191EFA",
    foreground: "#EEF2F7",
    caret: "#C4C4C4",
    selection: "#90B2D557",
    gutterBackground: "#15191EFA",
    gutterForeground: "#aaaaaa95",
    lineHighlight: "#57575712"
  },
  styles: [
    {
      tag: u.comment,
      color: "#6E6E6E"
    },
    {
      tag: [u.string, u.regexp, u.special(u.brace)],
      color: "#5C81B3"
    },
    {
      tag: u.number,
      color: "#C1E1B8"
    },
    {
      tag: u.bool,
      color: "#53667D"
    },
    {
      tag: [u.definitionKeyword, u.modifier, u.function(u.propertyName)],
      color: "#A3D295",
      fontWeight: "bold"
    },
    {
      tag: [u.keyword, u.moduleKeyword, u.operatorKeyword, u.operator],
      color: "#697A8E",
      fontWeight: "bold"
    },
    {
      tag: [u.variableName, u.attributeName],
      color: "#708E67"
    },
    {
      tag: [
        u.function(u.variableName),
        u.definition(u.propertyName),
        u.derefOperator
      ],
      color: "#fff"
    },
    {
      tag: u.tagName,
      color: "#A3D295"
    }
  ]
});
ye({
  variant: "dark",
  settings: {
    background: "#2e241d",
    foreground: "#BAAE9E",
    caret: "#A7A7A7",
    selection: "#DDF0FF33",
    gutterBackground: "#28211C",
    gutterForeground: "#BAAE9E90",
    lineHighlight: "#FFFFFF08"
  },
  styles: [
    {
      tag: u.comment,
      color: "#666666"
    },
    {
      tag: [u.string, u.special(u.brace)],
      color: "#54BE0D"
    },
    {
      tag: u.regexp,
      color: "#E9C062"
    },
    {
      tag: u.number,
      color: "#CF6A4C"
    },
    {
      tag: [u.keyword, u.operator],
      color: "#5EA6EA"
    },
    {
      tag: u.variableName,
      color: "#7587A6"
    },
    {
      tag: [u.definitionKeyword, u.modifier],
      color: "#F9EE98"
    },
    {
      tag: [u.propertyName, u.function(u.variableName)],
      color: "#937121"
    },
    {
      tag: [u.typeName, u.angleBracket, u.tagName],
      color: "#9B859D"
    }
  ]
});
ye({
  variant: "dark",
  settings: {
    background: "#3b2627",
    foreground: "#E6E1C4",
    caret: "#E6E1C4",
    selection: "#16120E",
    gutterBackground: "#3b2627",
    gutterForeground: "#E6E1C490",
    lineHighlight: "#1F1611"
  },
  styles: [
    {
      tag: u.comment,
      color: "#6B4E32"
    },
    {
      tag: [u.keyword, u.operator, u.derefOperator],
      color: "#EF5D32"
    },
    {
      tag: u.className,
      color: "#EFAC32",
      fontWeight: "bold"
    },
    {
      tag: [
        u.typeName,
        u.propertyName,
        u.function(u.variableName),
        u.definition(u.variableName)
      ],
      color: "#EFAC32"
    },
    {
      tag: u.definition(u.typeName),
      color: "#EFAC32",
      fontWeight: "bold"
    },
    {
      tag: u.labelName,
      color: "#EFAC32",
      fontWeight: "bold"
    },
    {
      tag: [u.number, u.bool],
      color: "#6C99BB"
    },
    {
      tag: [u.variableName, u.self],
      color: "#7DAF9C"
    },
    {
      tag: [u.string, u.special(u.brace), u.regexp],
      color: "#D9D762"
    },
    {
      tag: [u.angleBracket, u.tagName, u.attributeName],
      color: "#EFCB43"
    }
  ]
});
ye({
  variant: "dark",
  settings: {
    background: "#000205",
    foreground: "#FFFFFF",
    caret: "#E60065",
    selection: "#E60C6559",
    gutterBackground: "#000205",
    gutterForeground: "#ffffff90",
    lineHighlight: "#4DD7FC1A"
  },
  styles: [
    {
      tag: u.comment,
      color: "#404040"
    },
    {
      tag: [u.string, u.special(u.brace), u.regexp],
      color: "#00D8FF"
    },
    {
      tag: u.number,
      color: "#E62286"
    },
    {
      tag: [u.variableName, u.attributeName, u.self],
      color: "#E62286",
      fontWeight: "bold"
    },
    {
      tag: u.function(u.variableName),
      color: "#fff",
      fontWeight: "bold"
    }
  ]
});
ye({
  variant: "light",
  settings: {
    background: "#fff",
    foreground: "#000",
    caret: "#000",
    selection: "#BDD5FC",
    gutterBackground: "#fff",
    gutterForeground: "#00000070",
    lineHighlight: "#FFFBD1"
  },
  styles: [
    {
      tag: u.comment,
      color: "#BCC8BA"
    },
    {
      tag: [u.string, u.special(u.brace), u.regexp],
      color: "#5D90CD"
    },
    {
      tag: [u.number, u.bool, u.null],
      color: "#46A609"
    },
    {
      tag: u.keyword,
      color: "#AF956F"
    },
    {
      tag: [u.definitionKeyword, u.modifier],
      color: "#C52727"
    },
    {
      tag: [u.angleBracket, u.tagName, u.attributeName],
      color: "#606060"
    },
    {
      tag: u.self,
      color: "#000"
    }
  ]
});
const Ek = ye({
  variant: "dark",
  settings: {
    background: "#00254b",
    foreground: "#FFFFFF",
    caret: "#FFFFFF",
    selection: "#B36539BF",
    gutterBackground: "#00254b",
    gutterForeground: "#FFFFFF70",
    lineHighlight: "#00000059"
  },
  styles: [
    {
      tag: u.comment,
      color: "#0088FF"
    },
    {
      tag: u.string,
      color: "#3AD900"
    },
    {
      tag: u.regexp,
      color: "#80FFC2"
    },
    {
      tag: [u.number, u.bool, u.null],
      color: "#FF628C"
    },
    {
      tag: [u.definitionKeyword, u.modifier],
      color: "#FFEE80"
    },
    {
      tag: u.variableName,
      color: "#CCCCCC"
    },
    {
      tag: u.self,
      color: "#FF80E1"
    },
    {
      tag: [
        u.className,
        u.definition(u.propertyName),
        u.function(u.variableName),
        u.definition(u.typeName),
        u.labelName
      ],
      color: "#FFDD00"
    },
    {
      tag: [u.keyword, u.operator],
      color: "#FF9D00"
    },
    {
      tag: [u.propertyName, u.typeName],
      color: "#80FFBB"
    },
    {
      tag: u.special(u.brace),
      color: "#EDEF7D"
    },
    {
      tag: u.attributeName,
      color: "#9EFFFF"
    },
    {
      tag: u.derefOperator,
      color: "#fff"
    }
  ]
});
ye({
  variant: "dark",
  settings: {
    background: "#060521",
    foreground: "#E0E0E0",
    caret: "#FFFFFFA6",
    selection: "#122BBB",
    gutterBackground: "#060521",
    gutterForeground: "#E0E0E090",
    lineHighlight: "#FFFFFF0F"
  },
  styles: [
    {
      tag: u.comment,
      color: "#AEAEAE"
    },
    {
      tag: [u.string, u.special(u.brace), u.regexp],
      color: "#8DFF8E"
    },
    {
      tag: [
        u.className,
        u.definition(u.propertyName),
        u.function(u.variableName),
        u.function(u.definition(u.variableName)),
        u.definition(u.typeName)
      ],
      color: "#A3EBFF"
    },
    {
      tag: [u.number, u.bool, u.null],
      color: "#62E9BD"
    },
    {
      tag: [u.keyword, u.operator],
      color: "#2BF1DC"
    },
    {
      tag: [u.definitionKeyword, u.modifier],
      color: "#F8FBB1"
    },
    {
      tag: [u.variableName, u.self],
      color: "#B683CA"
    },
    {
      tag: [u.angleBracket, u.tagName, u.typeName, u.propertyName],
      color: "#60A4F1"
    },
    {
      tag: u.derefOperator,
      color: "#E0E0E0"
    },
    {
      tag: u.attributeName,
      color: "#7BACCA"
    }
  ]
});
ye({
  variant: "dark",
  settings: {
    background: "#2d2f3f",
    foreground: "#f8f8f2",
    caret: "#f8f8f0",
    selection: "#44475a",
    gutterBackground: "#282a36",
    gutterForeground: "rgb(144, 145, 148)",
    lineHighlight: "#44475a"
  },
  styles: [
    {
      tag: u.comment,
      color: "#6272a4"
    },
    {
      tag: [u.string, u.special(u.brace)],
      color: "#f1fa8c"
    },
    {
      tag: [u.number, u.self, u.bool, u.null],
      color: "#bd93f9"
    },
    {
      tag: [u.keyword, u.operator],
      color: "#ff79c6"
    },
    {
      tag: [u.definitionKeyword, u.typeName],
      color: "#8be9fd"
    },
    {
      tag: u.definition(u.typeName),
      color: "#f8f8f2"
    },
    {
      tag: [
        u.className,
        u.definition(u.propertyName),
        u.function(u.variableName),
        u.attributeName
      ],
      color: "#50fa7b"
    }
  ]
});
ye({
  variant: "light",
  settings: {
    background: "#FFFFFF",
    foreground: "#000000",
    caret: "#000000",
    selection: "#80C7FF",
    gutterBackground: "#FFFFFF",
    gutterForeground: "#00000070",
    lineHighlight: "#C1E2F8"
  },
  styles: [
    {
      tag: u.comment,
      color: "#AAAAAA"
    },
    {
      tag: [u.keyword, u.operator, u.typeName, u.tagName, u.propertyName],
      color: "#2F6F9F",
      fontWeight: "bold"
    },
    {
      tag: [u.attributeName, u.definition(u.propertyName)],
      color: "#4F9FD0"
    },
    {
      tag: [u.className, u.string, u.special(u.brace)],
      color: "#CF4F5F"
    },
    {
      tag: u.number,
      color: "#CF4F5F",
      fontWeight: "bold"
    },
    {
      tag: u.variableName,
      fontWeight: "bold"
    }
  ]
});
ye({
  variant: "light",
  settings: {
    background: "#f2f1f8",
    foreground: "#0c006b",
    caret: "#5c49e9",
    selection: "#d5d1f2",
    gutterBackground: "#f2f1f8",
    gutterForeground: "#0c006b70",
    lineHighlight: "#e1def3"
  },
  styles: [
    {
      tag: u.comment,
      color: "#9995b7"
    },
    {
      tag: u.keyword,
      color: "#ff5792",
      fontWeight: "bold"
    },
    {
      tag: [u.definitionKeyword, u.modifier],
      color: "#ff5792"
    },
    {
      tag: [u.className, u.tagName, u.definition(u.typeName)],
      color: "#0094f0"
    },
    {
      tag: [u.number, u.bool, u.null, u.special(u.brace)],
      color: "#5842ff"
    },
    {
      tag: [u.definition(u.propertyName), u.function(u.variableName)],
      color: "#0095a8"
    },
    {
      tag: u.typeName,
      color: "#b3694d"
    },
    {
      tag: [u.propertyName, u.variableName],
      color: "#fa8900"
    },
    {
      tag: u.operator,
      color: "#ff5792"
    },
    {
      tag: u.self,
      color: "#e64100"
    },
    {
      tag: [u.string, u.regexp],
      color: "#00b368"
    },
    {
      tag: [u.paren, u.bracket],
      color: "#0431fa"
    },
    {
      tag: u.labelName,
      color: "#00bdd6"
    },
    {
      tag: u.attributeName,
      color: "#e64100"
    },
    {
      tag: u.angleBracket,
      color: "#9995b7"
    }
  ]
});
ye({
  variant: "light",
  settings: {
    background: "#faf4ed",
    foreground: "#575279",
    caret: "#575279",
    selection: "#6e6a8614",
    gutterBackground: "#faf4ed",
    gutterForeground: "#57527970",
    lineHighlight: "#6e6a860d"
  },
  styles: [
    {
      tag: u.comment,
      color: "#9893a5"
    },
    {
      tag: [u.bool, u.null],
      color: "#286983"
    },
    {
      tag: u.number,
      color: "#d7827e"
    },
    {
      tag: u.className,
      color: "#d7827e"
    },
    {
      tag: [u.angleBracket, u.tagName, u.typeName],
      color: "#56949f"
    },
    {
      tag: u.attributeName,
      color: "#907aa9"
    },
    {
      tag: u.punctuation,
      color: "#797593"
    },
    {
      tag: [u.keyword, u.modifier],
      color: "#286983"
    },
    {
      tag: [u.string, u.regexp],
      color: "#ea9d34"
    },
    {
      tag: u.variableName,
      color: "#d7827e"
    }
  ]
});
ye({
  variant: "light",
  settings: {
    background: "#FFFFFF",
    foreground: "#000000",
    caret: "#000000",
    selection: "#FFFD0054",
    gutterBackground: "#FFFFFF",
    gutterForeground: "#00000070",
    lineHighlight: "#00000008"
  },
  styles: [
    {
      tag: u.comment,
      color: "#CFCFCF"
    },
    {
      tag: [u.number, u.bool, u.null],
      color: "#E66C29"
    },
    {
      tag: [
        u.className,
        u.definition(u.propertyName),
        u.function(u.variableName),
        u.labelName,
        u.definition(u.typeName)
      ],
      color: "#2EB43B"
    },
    {
      tag: u.keyword,
      color: "#D8B229"
    },
    {
      tag: u.operator,
      color: "#4EA44E",
      fontWeight: "bold"
    },
    {
      tag: [u.definitionKeyword, u.modifier],
      color: "#925A47"
    },
    {
      tag: u.string,
      color: "#704D3D"
    },
    {
      tag: u.typeName,
      color: "#2F8996"
    },
    {
      tag: [u.variableName, u.propertyName],
      color: "#77ACB0"
    },
    {
      tag: u.self,
      color: "#77ACB0",
      fontWeight: "bold"
    },
    {
      tag: u.regexp,
      color: "#E3965E"
    },
    {
      tag: [u.tagName, u.angleBracket],
      color: "#BAA827"
    },
    {
      tag: u.attributeName,
      color: "#B06520"
    },
    {
      tag: u.derefOperator,
      color: "#000"
    }
  ]
});
ye({
  variant: "light",
  settings: {
    background: "#fef7e5",
    foreground: "#586E75",
    caret: "#000000",
    selection: "#073642",
    gutterBackground: "#fef7e5",
    gutterForeground: "#586E7580",
    lineHighlight: "#EEE8D5"
  },
  styles: [
    {
      tag: u.comment,
      color: "#93A1A1"
    },
    {
      tag: u.string,
      color: "#2AA198"
    },
    {
      tag: u.regexp,
      color: "#D30102"
    },
    {
      tag: u.number,
      color: "#D33682"
    },
    {
      tag: u.variableName,
      color: "#268BD2"
    },
    {
      tag: [u.keyword, u.operator, u.punctuation],
      color: "#859900"
    },
    {
      tag: [u.definitionKeyword, u.modifier],
      color: "#073642",
      fontWeight: "bold"
    },
    {
      tag: [u.className, u.self, u.definition(u.propertyName)],
      color: "#268BD2"
    },
    {
      tag: u.function(u.variableName),
      color: "#268BD2"
    },
    {
      tag: [u.bool, u.null],
      color: "#B58900"
    },
    {
      tag: u.tagName,
      color: "#268BD2",
      fontWeight: "bold"
    },
    {
      tag: u.angleBracket,
      color: "#93A1A1"
    },
    {
      tag: u.attributeName,
      color: "#93A1A1"
    },
    {
      tag: u.typeName,
      color: "#859900"
    }
  ]
});
ye({
  variant: "light",
  settings: {
    background: "#FFFFFF",
    foreground: "#4D4D4C",
    caret: "#AEAFAD",
    selection: "#D6D6D6",
    gutterBackground: "#FFFFFF",
    gutterForeground: "#4D4D4C80",
    lineHighlight: "#EFEFEF"
  },
  styles: [
    {
      tag: u.comment,
      color: "#8E908C"
    },
    {
      tag: [u.variableName, u.self, u.propertyName, u.attributeName, u.regexp],
      color: "#C82829"
    },
    {
      tag: [u.number, u.bool, u.null],
      color: "#F5871F"
    },
    {
      tag: [u.className, u.typeName, u.definition(u.typeName)],
      color: "#C99E00"
    },
    {
      tag: [u.string, u.special(u.brace)],
      color: "#718C00"
    },
    {
      tag: u.operator,
      color: "#3E999F"
    },
    {
      tag: [u.definition(u.propertyName), u.function(u.variableName)],
      color: "#4271AE"
    },
    {
      tag: u.keyword,
      color: "#8959A8"
    },
    {
      tag: u.derefOperator,
      color: "#4D4D4C"
    }
  ]
});
const XO = new vr();
function Wk(r) {
  const e = r.lastIndexOf(".");
  if (e >= 0)
    switch (r.substring(e + 1).toLowerCase()) {
      case "json":
        return Fh();
      case "md":
        return Cy();
      case "html":
        return pd();
      case "js":
      case "json5":
      case "mjs":
        return Al();
    }
  return Fh();
}
const Ul = document.getElementById("root"), Yk = C.theme({
  "&": {
    backgroundColor: faraday.theme.colors["panel.background"],
    color: faraday.theme.colors["panel.foreground"],
    width: "100%",
    height: "100%",
    overflow: "hidden"
  },
  "& .cm-gutters": {
    backgroundColor: `color-mix(in srgb, ${faraday.theme.colors["panel.background"]}, ${faraday.theme.colors["panel.foreground"]} 5%)`,
    color: faraday.theme.colors["panel.foreground"]
  },
  "& .cm-scroller": {
    height: "100% !important"
  }
}), jt = new C({
  extensions: [Mk, Yk, Ek, XO.of(Al()), B.readOnly.of(!0)],
  parent: Ul
}), Ko = async (r) => {
  const e = Wk(r), t = jt.state.facet(yt), i = await Xy(r), n = new TextDecoder().decode(i), s = jt.state.update({
    changes: { from: 0, to: jt.state.doc.length, insert: n },
    effects: e.language !== t ? XO.reconfigure(e) : void 0
  });
  jt.dispatch(s), Ul.style.visibility = "visible";
};
function Nk() {
  console.info("Activated"), faraday.events.on("activefilechange", Ko), faraday.activefile && Ko(faraday.activefile);
}
function _k() {
  console.info("Deactivated"), Ul.style.visibility = "hidden", faraday.events.off("activefilechange", Ko), jt.dispatch(jt.state.update({ changes: { from: 0, to: jt.state.doc.length, insert: "" } }));
}
export {
  Nk as activate,
  _k as deactivate
};
